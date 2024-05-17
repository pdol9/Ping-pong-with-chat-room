import Image from 'next/image';
import React from 'react';

const Loading: React.FC = () => {

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>
        <h1 style={{ textAlign: 'center' }}><b></b></h1>
      </div>
      <div>
        <Image src="/loading.png" alt="Loading.." width={300} height={300} />
      </div>
    </div>
  );
}

export default Loading;