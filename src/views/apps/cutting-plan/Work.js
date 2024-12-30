import React, { useState } from 'react';

const Work = () => {
  const [data, setData] = useState('');
  const evtSource = new EventSource('/api/plan/events');

  evtSource.addEventListener('plan_complete', function (e) {
    console.log(e.data);
    setData(e.data);
  });
  return (
    <div>
      <h1>테스트 {data}</h1>
    </div>
  );
};

export default Work;
