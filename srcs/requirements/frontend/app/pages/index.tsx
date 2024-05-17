import '../app/globals.css';
import React, { useContext, useEffect, useState } from 'react';
import UserPreview, { User } from '@/components/userPreview';
import { AuthContext } from '@/contexts/AuthContext';
import Ranks from '@/components/home/ranks';
import '../styles/index.css';
import AuthLayout from '@/layouts/auth';
import Loading from '@/components/loading';
import Image from 'next/image';

const IndexPage: React.FC = () => {
	const { user } = useContext(AuthContext);
  const [usr, setUsr] = useState<User | null>(null);

  useEffect(() => {
    setUsr(user);
  }, [user]);

  if (usr) {
    return (
      // <AuthLayout>
      //   <div>
      //     <h1 style={{ color: 'purple', marginLeft: '900px', marginTop: '0px', fontSize: '50px' }}><b>Welcome to World of Pong</b></h1>
      //   </div>

      //   <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '0px' }}>
      //     <div style={{ border: '5px solid', width: '50%', padding: '10px',  marginTop: '0px' }}>

      //       <div style={{ border: '3px solid black', padding: '10px', width: '35%', color: 'green'}}>
      //         <h1><b>Your Stats:</b></h1>
      //         <UserPreview user={usr} />
      //       </div>
      //       <div >
      //         <div style={{ border: '3px solid black', padding: '10px', width: '50%'}}>
      //           <Ranks />
      //         </div>
      //       </div>
      //     </div>
      //     <div style={{ display: 'flex', justifyContent: 'center' }}>
      //     </div>
      //     <div style={{ marginTop: '200px' }} >
      //       <Image src="/playa.jpeg" alt="playa" width={500} height={500} />
      //     </div>
      //   </div>
      // </AuthLayout>

      <AuthLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingLeft: '80px', minHeight: '10vh' }}>
        <h1 style={{ color: 'purple', fontSize: '50px', margin: '0' }}><b>Welcome to World of Pong</b></h1>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: '80vh', paddingLeft: '80px', paddingRight: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ width: '45%', marginBottom: '20px' }}>
          <div style={{ border: '3px solid black', padding: '10px', color: 'green' }}>
            <h2><b>Your Stats:</b></h2>
            <UserPreview user={usr} />
          </div>
          <div style={{ border: '3px solid black', padding: '10px' }}>
            <h2><b>Ranks:</b></h2>
            <Ranks />
          </div>
        </div>
        <div style={{ width: '45%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/playa.jpeg" alt="playa" width={700} height={700} />
        </div>
      </div>
    </AuthLayout>
    );
  } else {
    return (
      <AuthLayout>
        <Loading />
      </AuthLayout>
    );
  }
  };
  
  export default IndexPage;

//------- previous
// const IndexPage: React.FC = () => {
//   const { user } = useContext(AuthContext);

//   return (
//     <AuthLayout>
// 	<div /*style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', margin: 'auto' }}*/>
      
//         <Sidebar />
// 		<div>
//           <h1 style={{ marginLeft: '150px', color: 'purple', marginLeft: '900px', marginTop: '0px', fontSize: '50px' }}><b>Welcome to World of Pong</b></h1>
//         </div>

// 		<div style={{ border: '3px solid red', padding: '10px', width: '10%', color: 'green', marginLeft: '100px', marginTop: '150px'}}>
// 			<h1><b>Your Stats:</b></h1>
//           <UserPreview user={user} />
//         </div>

// 		<div style={{ border: '3px solid green', padding: '10px', width: '30%', marginLeft: '200px'}}>
//           <Ranks />
// 		</div>

// 		<div style={{ border: '3px solid yellow', width: '40%', padding: '10px',  marginTop: '0px', marginLeft: '100px' }}>


// 		<div>
			
//         </div>
//       </div>
// 	  <div style={{ display: 'flex', justifyContent: 'center' }}>
// 		<div style={{ margin: '20px' }} >
// 		<img src="/playa.jpeg" alt="playa" style={{ width: '500px', height: '500px', margin: '0 auto' }} />
// 		</div>
// 	  </div>
// 	</div>
//     </AuthLayout>
//   );
// };

// export default IndexPage;

//------ original all of sudden not properly working anymore

// const IndexPage: React.FC = () => {
// 	const { user } = useContext(AuthContext);
  
// 	return (
// 	  <AuthLayout>
// 		<div className="center">
// 		  <Sidebar />
// 		  <div>
// 			<h1 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><b>Welcome to World of Pong</b></h1>
// 		  </div>
// 		  <div style={{ border: '3px solid black', padding: '10px', width: '35%'}}>
// 			  <h1><b>Your Stats:</b></h1>
// 			<UserPreview user={user} />
// 		  </div>
// 		  <div style={{ display: 'flex', justifyContent: 'flex-end' }} >
// 			  <div style={{ border: '3px solid black', padding: '10px', width: '50%'}}>
// 			<Ranks />
// 			</div>
// 		  </div>
// 		</div>
// 		<div style={{ display: 'flex', justifyContent: 'center' }}>
// 		  <div style={{ margin: '20px' }} >
// 			  <img src="/playa.jpeg" alt="playa" style={{ width: '500px', height: '500px' }} />
// 			  </div>
// 		  </div>
// 	  </AuthLayout>
// 	);
//   };
  
//   export default IndexPage;
  
