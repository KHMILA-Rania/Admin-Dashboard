import React , {useState} from "react";
import { Text, View ,TextInput ,StyleSheet,TouchableOpacity, Alert,ActivityIndicator} from "react-native";
import { useNavigation } from "@react-navigation/native";
import style from "./style";
function ResetPassword(){
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        console.log("Reset Password button clicked");
        console.log("Current email:", email);
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email.");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("http://192.168.1.177:3000/auth/sendEmail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", data.message || "A reset link has been sent to your email.");
                navigation.goBack();
            } else {
                Alert.alert("Error", data.message || "Something went wrong. Try again.");
            }
        } catch (error) {
            Alert.alert("Error", "Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return(
        <View style={styles.container}>
            <Text style={style.text_header}> Resret your password</Text>

            
            <Text style={{color: 'gray', fontWeight: '900', textAlign:'center', marginBottom: '50' , marginTop: '30'}}>Enter your email , we'll send a link to reset your password</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                keyboardType="email-address"
                value={email} // Ensure it is bound to state
                onChangeText={(text) => {
                    console.log("User typed:", text); // Debug log
                    setEmail(text);}}
            />

            <TouchableOpacity style={[style.inBut,{marginLeft:'50'}]} onPress={handleResetPassword}>
                <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        color: "#000",
    },
    button: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
})

export default ResetPassword