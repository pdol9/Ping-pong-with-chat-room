// // utils/sessionValidation.ts

// import { useContext, useEffect, useState } from 'react';
// import axios from 'axios';
// import { AppProps } from 'next/app';
// import { useRouter } from 'next/router';
// import Sidebar from '../components/sidebar';
// import IndexPage from '../pages/index';

// //import MyComponent from '@/components/WebSocketButton';
// import { SocketProvider } from '@/contexts/SocketContext';
// // export const useSessionValidation = (): [boolean, (isValid: boolean) => void] => {
// // 	//const { login, logout } = useContext(UserContext);
// //   let [isValidSesh, setIsValidSesh] = useState(false);
// //  //let  isValidSesh = false;
// //   useEffect(() => {
// // 	console.log('in seshvalid');
	
// // 		const seshValid = async () => {
// // 		try{
// // 		console.log('before get sesh value is: ', isValidSesh);
// // 		axios
// // 		.get('/api/auth/validateSession')
// // 		.then(response => {
// // 			let responseData = response.data;
// // 			//console.log('hi iiiin get');
// // 			//console.log('received: ', response.data.login);
// // 			console.log('seshValid set to true');
// // 			setIsValidSesh(true);
// // 			//if (response.data.login){
// // 				//isValidSesh = true;
// // 			//	}
// // 		})
// // 		.catch(error => {
// // 			//logout();
// // 			//console.log('Error from validSesh is: ', error);
// // 			//isValidSesh = false;
// // 			console.log('1seshValid set to false');
// // 			setIsValidSesh(false);
// // 		});
// // 		console.log('after get sesh value is: ', isValidSesh);

// // 	}
// // 	catch (error) {
// // 		//console.log('Error from validSesh is: ', error);
// // 		console.log('2seshValid set to false');
// //         setIsValidSesh(false);
// // 	}
// // 	}

// // 	seshValid();
// //   }, []);

// //   return [isValidSesh, setIsValidSesh];
// // };

// // export default useSessionValidation;


// //_____
// // let [isValidSesh, setIsValidSesh] = useState(false);
// // 		const seshValid = () => {
// // 		try{
// // 		console.log('before get sesh value is: ', isValidSesh);
// // 		axios
// // 		.get('/api/auth/validateSession')
// // 		.then(response => {
// // 			let responseData = response.data;
// // 			//console.log('hi iiiin get');
// // 			//console.log('received: ', response.data.login);
// // 			console.log('seshValid set to true');
// // 			setIsValidSesh(true);
// // 			//if (response.data.login){
// // 				//isValidSesh = true;
// // 			//	}
// // 		})
// // 		.catch(error => {
// // 			//logout();
// // 			//console.log('Error from validSesh is: ', error);
// // 			//isValidSesh = false;
// // 			console.log('1seshValid set to false');
// // 			setIsValidSesh(false);
// // 		});

// // --------

// export let isValidSesh = false;

// export const seshValid = async (): Promise<void> => {
//   try {
// 	axios
// 			.get('/api/auth/validateSession')
// 			.then(response => {
// 				let responseData = response.data;
// 				//console.log('hi iiiin get');
// 				console.log('received: ', responseData.login);
// 				console.log('seshValid set to true');
// 				isValidSesh = true;
// 				//if (response.data.login){
// 					//isValidSesh = true;
// 				})
// 				.catch(error => {
// 								//logout();
// 								console.log('Error from validSesh is: ', error);
// 								isValidSesh = false;
// 								console.log('1seshValid set to false');
// 								//setIsValidSesh(false);
// 							});

// 	}
//    catch (error) {
// 	console.log('seshValid set to false');
//     isValidSesh = false;
//   }
// };
