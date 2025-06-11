
import ContactUs from '../models/contactUs.js';


const Contact = async (req, res) => {
    try {
        console.log("Contact Us request received:", req.body);
        const { name,email, message } = req.body;
        
        


        const newContact = new ContactUs({ name,email, message });
        await newContact.save();
        
        res.status(201).json({ message: 'contact added successfully', contact: newContact });
    } catch (error) {
        res.status(500).json({ message: 'Error adding contact ', error });
        console.error('Error in Contact Us:', error.message);
    }
};

export {
    Contact
};
