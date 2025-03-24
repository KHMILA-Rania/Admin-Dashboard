import {StyleSheet} from 'react-native';

const style= StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
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
    width: 260,
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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 65,
    borderColor: 'black',  // Set the border color to black
    borderWidth: 1, 
    marginHorizontal: 30,
    borderRadius: 50

  },
  header: {
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  text_header: {
    color: '#4B9CD3',
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
    width: '70%',
    backgroundColor: '#4B9CD3',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 50,
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