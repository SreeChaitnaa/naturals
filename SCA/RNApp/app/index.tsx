// app/index.tsx
import { Stack } from "expo-router";
import React, { useState } from "react";
import { Button, Platform, StyleSheet, Text, TextInput, View } from "react-native";

// Mock of your shopConfig (you’ll replace this with your actual config)
const shopConfig: Record<string, { encKey: string; url: string }> = {
  Shop1: { encKey: "abc123", url: "https://example.com/" },
  Shop2: { encKey: "def456", url: "https://another.com/" },
};

// Example decrypt function
function decryptApiKey(encKey: string, password: string): string | null {
  if (password === "test") return encKey + "-decrypted"; // replace with real logic
  return null;
}

export default function LoginScreen() {
  const [shop, setShop] = useState("Shop1");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setError("");
      setLoading(true);

      const encKey = shopConfig[shop].encKey;
      const db_url = shopConfig[shop].url;
      const apiUrl = db_url + "config";
      const db_apiKey = decryptApiKey(encKey, password);

      if (!db_apiKey) throw new Error("Bad password");

      const db_headers = {
        headers: {
          "Content-Type": "application/json",
          "x-apikey": db_apiKey,
          "cache-control": "no-cache",
        },
      };

      // Test fetch
      const res = await fetch(apiUrl, db_headers);
      if (!res.ok) throw new Error("Login failed");

      const data = await res.json();

      console.log("✅ Data:", data);

      // TODO: navigate to Reports screen
      // router.push("/reports");

    } catch (e: any) {
      setError(`Invalid password or API key - ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Set custom title */}
    <Stack.Screen options={{ title: "Login" }} />
    <View style={styles.container}>
        <View style={styles.loginBox}>
            <Text style={styles.title}>Shop Login</Text>

            <Text>Select Shop: {shop}</Text>

            <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
            />

            <View style={styles.buttonWrapper}>
                <Button title={loading ? "Logging in..." : "Login"} onPress={login} />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    </View>
    </>
);
}

const shadowStyle = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  android: {
    elevation: 4, // Android uses elevation for shadows
  },
  web: {
    boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
  },
});

const styles = StyleSheet.create({
  loginBox: {
    width: "90%",
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "white",
    alignSelf: "center",
    marginTop: 100,
    ...shadowStyle,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: { fontSize: 22, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  buttonWrapper: {
    marginTop: 10,
  },
  error: { color: "red", marginTop: 10, textAlign: "center" },
});
