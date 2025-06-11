import mongoose from 'mongoose';

const ContactUsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String }
});

const ContactUs = mongoose.model('ContactUs', ContactUsSchema);

export default ContactUs;
