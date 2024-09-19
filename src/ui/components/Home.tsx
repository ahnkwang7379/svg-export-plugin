import React, { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleClickExtract = useCallback(() => {
    navigate('extract');
  }, [navigate]);

  return (
    <div>
      <button type="button" onClick={handleClickExtract}>
        아이콘 추출
      </button>
    </div>
  );
}

export default Home;