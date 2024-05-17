import { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const renderContent = () => {
    return <Component {...pageProps} />;
  };

  return (
    <AuthProvider>
      <SocketProvider>
        <div>{renderContent()}</div>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;



//------working with incorrect path
// const App : React.FC<AppProps> = ({ Component, pageProps }) => {
// 	const router = useRouter();
// 	const { pathname } = router;

// 	const [isValidSesh, setIsValidSesh] = useState(false);
// 	useEffect(() => {
// 		const { pathname } = router;
// 		//const timeoutId = setTimeout(() => {
// 		seshValid();
// 		//}, 2000);
// 	}, [router.pathname]);
  
// 	const seshValid = () => {
// 		console.log('in seshvalid');
// 		console.log('before get sesh value is: ', isValidSesh);
// 		axios
// 		.get('/api/auth/validateSession')
// 		.then(response => {
// 			let responseData = response.data;
// 			 console.log('hi in get');
// 			console.log('received: ', response.data.login);
// 			//if (response.data.login){
// 				setIsValidSesh(true);
// 			//	}
// 		})
// 		.catch(error => {
// 			console.log('Error from validSesh is: ', error);
// 			setIsValidSesh(false);
// 		});
// 		console.log('after get sesh value is: ', isValidSesh);
// 	}

// 	const renderContent = () => {
// 		//console.log('in render ');
// 		if (pathname === '/callback')
// 		{
// 			// seshValid();
// 			// if (!isValidSesh) 
// 			// return (<IndexPage {...pageProps} />);
// 			// else {
// 				return (
// 				<>
// 				<Component {...pageProps} />;
// 				</>);
// 			//}
// 		}
// 		if (pathname === '/') {	
// 			console.log('in _app: before return page: ', isValidSesh);
// 			seshValid();
// 			 if (!isValidSesh) 
// 				return (<IndexPage {...pageProps} />);
// 			 else {
// 				 console.log('hier');
// 			 	return (
// 					<>
// 					<Sidebar/>
// 					<Profile {...pageProps} />;
// 					</>);
// 			 }
// 		} 
// 		else if (pathname === '/game') {
// 			if (!isValidSesh) {
// 				console.log('okok');
// 				return( <IndexPage {...pageProps} />); /*router.push('login');*/ // better use router('login') damit url stimmt;
// 			}
// 			else
// 				return (<Component {...pageProps} />);
// 		}
// 		else if (pathname != '/' && pathname != '/game') {
// 			if (!isValidSesh) {
// 				return (<IndexPage {...pageProps} />);
// 			}
// 			else {
// 				return (
// 					<>
// 						<Sidebar/>
// 						{/* <div>
// 							<h1>WebSocket Test</h1>
// 							<MyComponent />
// 						</div> */}

// 						<Component {...pageProps} />
// 					</>
// 				);
// 				}
// 		  }
// 	  };

// 	return (
// 	 <div>{renderContent()}</div>
// 	);
//   };
  
//   export default App;