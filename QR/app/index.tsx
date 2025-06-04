import { useState, useEffect } from "react";
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from "react-native";

import * as Location from "expo-location";
import * as Clipboard from "expo-clipboard";
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from "expo-camera";

import { connectDb } from "../src/database";
import { ScannedCode } from "../src/models";

export default function QRScanner() {
  const [coords, setCoords] = useState<Location.LocationObject | null>(null);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [cameraDirection, setCameraDirection] = useState<CameraType>("back");
  const [camPermission, requestCamPermission] = useCameraPermissions();
  const [codesList, setCodesList] = useState<ScannedCode[]>([]);

  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setMsgError("Acceso a la ubicación denegado");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords(pos);
    };

    const fetchStoredCodes = async () => {
      const db = await connectDb();
      const stored = await db.consultarCodigos();
      setCodesList(stored);
    };

    fetchLocation();
    fetchStoredCodes();
  }, []);

  if (!camPermission) return <View />;
  if (!camPermission.granted) {
    return (
      <View style={styles.centered}>
        <Text>Se requiere permiso de cámara.</Text>
        <Button title="Solicitar Permiso" onPress={requestCamPermission} />
      </View>
    );
  }

  const handleBarcode = async (result: BarcodeScanningResult) => {
    alert(result.data);
    const db = await connectDb();
    await db.insertarCodigo(result.data, result.type);
    const updated = await db.consultarCodigos();
    setCodesList(updated);
  };

  const renderCodeItem = ({ item }: { item: ScannedCode }) => {
    const copyToClipboard = () => Clipboard.setStringAsync(item.data);

    return (
      <View style={styles.codeItem}>
        <Text style={styles.codeText}>{item.data}</Text>
        <TouchableOpacity onPress={copyToClipboard}>
          <Text style={styles.copyBtn}>Copiar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.locationText}>
        GPS: {msgError ? msgError : coords ? JSON.stringify(coords) : "Esperando..."}
      </Text>

      <CameraView
        style={styles.camera}
        facing={cameraDirection}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "code128", "datamatrix", "aztec"],
        }}
        onBarcodeScanned={handleBarcode}
      />

      <FlatList
        data={codesList}
        keyExtractor={(item) => item.id}
        renderItem={renderCodeItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    width: "100%",
    height: 250,
    marginBottom: 16,
  },
  locationText: {
    marginBottom: 8,
    color: "#444",
  },
  codeItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  codeText: {
    fontSize: 14,
    marginBottom: 6,
  },
  copyBtn: {
    color: "#007bff",
  },
});
