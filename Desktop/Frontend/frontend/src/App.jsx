import { useState } from 'react';
import userImage from './assets/username-image.svg';
import './App.css';
import SignupReusable from './component/SignupComponent/SignupReusable';

function App() {
  return (
    <div>
      {/* <SignupReusable img={userImage} altText="Username Image" btnText={"Get OTP"} currentStep={1} currentColor={'#80FFA6'} form={[{
        current:0
      }]} /> */}
      <SignupReusable img={userImage} altText="Username Image" btnText={"Proceed ->"} currentStep={3} currentColor={'#F7EADE'} form={[{
        current:4
      }]} />
    </div>
  );
}

export default App;
