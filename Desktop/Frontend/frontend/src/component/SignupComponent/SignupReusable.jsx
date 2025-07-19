import React from 'react';
import './SignupReusable.css';

const SignupReusable = ({ img, altText = "Signup Image", btnText, totalSteps = 5, currentStep, currentColor, form }) => {
  const circles = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className='container'>
      <div className='top-part'>
        {circles.map((step) => {
          let style = {};
          if (step === currentStep) {
            style = {
              backgroundColor: currentColor,
              boxShadow: `1px 1px 5px ${currentColor}`
            };
          }

          return (
            <div
              key={step}
              className={`circle 
                ${step < currentStep ? 'completed' : ''} 
                ${step > currentStep ? 'notCompleted' : ''}`}
              style={style}
            ></div>
            
          );
        })}
      </div>

      <div className='main-part'>
        {
          form.map((value, i) => {
            switch (value.current) {
              case 0:
                return (
                  <div className='form form-1' key={i}>
                    <label>Username</label>
                    <input type='text' placeholder='Enter Your Username' />

                    <label>Mobile No.</label>
                    <input type='text' placeholder='Enter Your Mobile Number' />

                    <button style={{ backgroundColor: currentColor }}>{btnText}</button>
                  </div>
                );

              case 1:
                return (
                  <div className='form' key={i}>
                    <div>
                      <label>Verify OTP</label>
                    </div>
                    <ul className='otp-container'>
                      <li></li>
                      <li></li>
                      <li></li>
                      <li></li>
                    </ul>

                    <button style={{ backgroundColor: currentColor }}>{btnText}</button>
                  </div>
                );

              case 2:
                return (
                  <div className='form' key={i}>
                    <div>
                      <label>Select Your Role</label>
                    </div>
                    <select>
                      <option value="">-- Select --</option>
                      <option value="student">Student</option>
                      <option value="company">Company</option>
                    </select>
                    <button style={{ backgroundColor: currentColor }}>{btnText}</button>
                  </div>
                );
              case 3:
                return (
                  <div className="form">
                    {/* Row 1 */}
                    <div style={{ display: 'flex', gap: '40px' }}>
                      <div style={{ flex: 1 }}>
                        <label>FIRST NAME *</label>
                        <input type="text" required />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>LAST NAME *</label>
                        <input type="text" required />
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div style={{ display: 'flex', gap: '40px' }}>
                      <div style={{ flex: 1 }}>
                        <label>HIGHEST EDUCATION </label>
                        <input type="text" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>INSTITUTE </label>
                        <input type="text" />
                      </div>
                    </div>

                    {/* Row 3 */}
                    <div style={{ display: 'flex', gap: '40px' }}>
                      <div style={{ flex: 1 }}>
                        <label>JOB TITLE </label>
                        <input type="text" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>RESUME DRIVE LINK </label>
                        <input type="text" />
                      </div>
                    </div>

                    {/* Row 4 */}
                    <div style={{ display: 'flex', gap: '40px' }}>
                      <div style={{ flex: 1 }}>
                        <label>SKILLS</label>
                        <input type="text" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>LOCATION</label>
                        <input type="text" />
                      </div>
                    </div>

                    {/* Button */}
                    <button style={{ backgroundColor: currentColor }}>{btnText}</button>
                  </div>
                );
              case 4:
                return (
                  <div className='last-page'>
                    <div>
                      <h2>Hurray! 🥳🎉</h2>
                      <h2>Registration Completed</h2>
                    </div>
                    <button style={{ backgroundColor: currentColor }}>{btnText}<img src={img} /></button>
                  </div>
                );
              default:
                return null;
            }
          })
        }

        <div className='imageContainer'>
          <img src={img} alt={altText} />
        </div>
      </div>
    </div>
  );
};

export default SignupReusable;
