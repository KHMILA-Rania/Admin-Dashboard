import React , {useState} from "react";
import { Text, View ,TextInput ,StyleSheet,TouchableOpacity, Alert,ActivityIndicator} from "react-native";
import { useNavigation } from "@react-navigation/native";
import style from "./style";
import GLOBALS from "../global/variables";
import axios from "axios";
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
        
        // Using axios (recommended - cleaner syntax)
        const response = await axios.post(`http://${GLOBALS.IP}:3000/auth/sendEmail`, {
            email: email.trim()
        }, {
            headers: { 
                "Content-Type": "application/json" 
            }
        });

        console.log("Reset password response:", response.data);

        Alert.alert(
            "Success", 
            response.data.message || "A new password has been sent to your email."
        );
        navigation.goBack();

    } catch (error) {
        console.error("Reset password error:", error);
        
        let errorMessage = "Network error. Please try again.";
        
        if (error.response) {
            // Server responded with error status
            errorMessage = error.response.data.message || "Something went wrong. Try again.";
        } else if (error.request) {
            // Request was made but no response received
            errorMessage = "Unable to connect to server. Please check your internet connection.";
        }
        
        Alert.alert("Error", errorMessage);
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