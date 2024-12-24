import React, { useState, useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { CameraView, CameraType, FlashMode, useCameraPermissions } from "expo-camera";
import { useDispatch } from "react-redux";
import { addPhoto } from "../reducers/user";
import _FontAwesome from "react-native-vector-icons/FontAwesome";
import { useIsFocused } from "@react-navigation/native";

const routeBE = process.env.EXPO_PUBLIC_ADDRESS_IP;

const FontAwesome = _FontAwesome as React.ElementType;

export default function SnapScreen() {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();

    const [hasPermission, setHasPermission] = useCameraPermissions();
    const [type, setType] = useState<CameraType>("back");
    const [flashMode, setFlashMode] = useState(false);

    let cameraRef: any = useRef(null);

    const takePicture = async () => {
        const photo = await cameraRef.takePictureAsync({ quality: 0.3 });
        if (photo) {
            const uri = photo.uri;

            const formData = new FormData();
            formData.append("photoFromFront", {
                uri,
                name: "photo.jpg",
                type: "image/jpeg",
            });
            fetch(`${routeBE}/upload`, {
                method: "POST",
                body: formData,
            })
                .then(response => response.json())
                .then(data => data.result && dispatch(addPhoto(data.url)));
        }
    };

    if (!hasPermission || !isFocused) {
        return <View />;
    }

    return (
        <CameraView
            ref={(ref: any) => (cameraRef = ref)}
            style={styles.camera}
            enableTorch={flashMode}
            facing={type}
        >
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    onPress={() => setType(current => (current === "back" ? "front" : "back"))}
                    style={styles.button}
                >
                    <FontAwesome
                        name="rotate-right"
                        size={25}
                        color="#ffffff"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setFlashMode(current => !current)}
                    style={styles.button}
                >
                    <FontAwesome
                        name="flash"
                        size={25}
                        color={flashMode ? "#e8be4b" : "#ffffff"}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.snapContainer}>
                <TouchableOpacity onPress={() => cameraRef && takePicture()}>
                    <FontAwesome
                        name="circle-thin"
                        size={95}
                        color="#ffffff"
                    />
                </TouchableOpacity>
            </View>
        </CameraView>
    );
}

const styles = StyleSheet.create({
    camera: {
        flex: 1,
    },
    buttonsContainer: {
        flex: 0.1,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
    },
    button: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderRadius: 50,
    },
    snapContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 25,
    },
});
