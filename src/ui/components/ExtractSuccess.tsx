import React, { useCallback } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

function ExtractSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { url } = location.state as { url: string };

  const handleClickGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '16px',
      }}
    >
      <span>아이콘 추출 성공!</span>
      <a href={url} target="_blank" rel="noreferrer">
        PR 링크
      </a>
      <button type="button" onClick={handleClickGoHome}>
        선택 단계로
      </button>
    </div>
  );
}

export default ExtractSuccess;