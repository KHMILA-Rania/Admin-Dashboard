import {StyleSheet} from 'react-native';

const style= StyleSheet.create({
  mainContainer: {
    backgroundColor: '#39B2DB',
  },
  textSign: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  smallIcon: {
    marginRight: 10,
    fontSize: 24,
  
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 230,
    width: 280,
    marginTop: 0,
    padding:0,

  },
  text_footer: {
    color: 'blue',
    fontSize: 18,
  },
  action: {
    flexDirection: 'row',
    paddingTop: 14,
    paddingBottom: 3,
    marginTop: 15,

    paddingHorizontal: 15,

    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 50,
  },
  textInput: {
    flex: 1,
    marginTop: -12,

    color: 'black',
   
  },
  loginContainer: {
    backgroundColor: '#daf0ff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 65,
    marginTop:0,
    marginBottom: 10,
    marginHorizontal: 25,
    borderRadius: 0,
    height: 420,
     shadowColor: '#000',
  shadowOffset: {
    width: 2,
    height: 4,
  },
  shadowOpacity: 0.9,
  shadowRadius: 6,

  // Shadow for Android
  elevation: 10,

  },
  header: {
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  text_header: {
    color: '#39B2DB',
    fontWeight: 'bold',
    fontSize: 30,
  
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    marginTop: -20,
    alignItems: 'center',
    textAlign: 'center',
    margin: 20,
  },
  inBut: {
    width: '80%',
    backgroundColor: '#39B2DB',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 50,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    
  },
  inBut2: {
    borderColor: 'black',  // Set the border color to black
    borderWidth: 1, 
    height: 30,
    width: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    color:'gray'
  },
  smallIcon2: {
    fontSize: 40,
    // marginRight: 10,
  },
  bottomText: {
    color: 'black',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  radioButton_div: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radioButton_inner_div: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButton_title: {
    fontSize: 20,
    color: '#420475',
  },
  radioButton_text: {
    fontSize: 16,
    color: 'black',
  },
 
});
export default style;