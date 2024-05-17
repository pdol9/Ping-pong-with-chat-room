import '../app/globals.css';
import '../styles/login.css';
import React from 'react';
import '../styles/login.css';
import image42 from '../public/42.jpg';
import Image from 'next/image';

const LoginPage: React.FC = () => {
  const handleClick = () => {
    try {
      const api42_authorize_url: string | URL = process.env.api42_authorize_url ?? '';
      // Redirect the user to the 42 authentication page
      window.location.assign(api42_authorize_url);
    } catch (error) {
      // console.log('Error handleClick:', error);
    }
  };

//   return (
//     <div className='Login-container'>
//       <div className='Login-title'>
//         <h1 className='Login-title'>cong Chat </h1>
//       </div>
//       <div className='box'></div>
//       <div className='Login-USP'>
//         <h1>Start your Journey</h1>
//       </div>
//       <div className='Login-second-row'>
//         <div className='Login-auth-buttons'></div>
//         <div>
//           <button
//             style={{ color: 'black' }}
//             title="Login with 42"
//             id="42button"
//             onClick={handleClick}
//           >
//             Login with 42
//           </button>
//         </div>
//       </div>
//     </div>
//   );

  return (
    <div className='login-main-container'>

      <div className='login-title'>
        <h1 className='login-title-text'>
          <span className='rectangle'></span>
		  Chat Pong
        </h1>
      </div>

      <div className='box'>

	  </div>

      <div className='login-USP'>
        <h1>Start your Journey</h1>
      </div>


	<div className="login-button">
		<button
			title="Login with "
			id="42button"
			onClick={handleClick}
		>
			<Image
			src={image42}
			alt="Login with "
			className="login-button-image"
			/>
			<text>Login with    </text> 
		</button>
	</div>


    </div>
  );



}

export default LoginPage;
