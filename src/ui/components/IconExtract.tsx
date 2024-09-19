/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import config from '../../config'
import type { PluginMessage } from '../../types/Message';
import { useCreatePRWithSvgMap } from '../hooks/useCreatePRWithSvgMap';

enum Step {
  Pending,
  Processing,
  Resolved,
}

interface ProgressProps {
  figmaToken: string;
  githubToken: string;
  onError: (msg: string) => void;
}

export function useProgress() {
  const [progressTitle, setProgressTitle] = useState('');
  const [progressValue, setProgressValue] = useState(0);

  const progress = useCallback(
    async <Fn extends () => Promise<any>>({
      callback,
      title,
      successValueOffset,
    }: {
      callback: Fn;
      title?: string;
      successValueOffset?: number;
    }) => {
      if (title) {
        setProgressTitle(title);
      }
      const result = await callback();
      if (successValueOffset) {
        setProgressValue((prev) => Math.min(prev + successValueOffset, 1));
      }
      return result as ReturnType<Fn>;
    },
    [],
  );

  return {
    progress,
    progressTitle,
    progressValue,
  };
}

function Progress({ figmaToken, githubToken, onError }: ProgressProps) {
  const navigate = useNavigate();

  const { progress, progressTitle, progressValue } = useProgress();

  const createPr = useCreatePRWithSvgMap({ progress, githubToken });

  useEffect(function bindOnMessageHandler() {
    window.onmessage = async (event: MessageEvent<PluginMessage>) => {
      const { type, payload } = event.data.pluginMessage;

      if (type === 'extractIcon') {
        try {
          const { svgByName } = payload;

          const prUrl = await createPr(svgByName);

          parent.postMessage(
            {
              pluginMessage: {
                type: 'setToken',
                payload: { figmaToken, githubToken },
              },
            },
            '*',
          );

          navigate('../extract_success', { state: { url: prUrl } });
        } catch (e: any) {
          onError(e?.message);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div
        style={{
          width: '100%',
          backgroundColor: '#f0f0f0',
          height: '4px',
        }}
      >
        <div
          style={{
            width: `${progressValue * 100}%`,
            backgroundColor: '#0070f3',
            height: '4px',
          }}
        />
      </div>
      <span>{progressTitle}</span>
    </div>
  );
}

function IconExtract() {
  const navigate = useNavigate();

  const [figmaToken, setFigmaToken] = useState('');
  const [githubToken, setGithubToken] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const [step, setStep] = useState(Step.Pending);

  useEffect(function getTokenFromLocalStorage() {
    parent.postMessage({ pluginMessage: { type: 'getToken' } }, '*');
  }, []);

  useEffect(function bindOnMessageHandler() {
    window.onmessage = async (event: MessageEvent<PluginMessage>) => {
      const { type, payload } = event.data.pluginMessage;

      if (type === 'getToken') {
        setFigmaToken(payload?.figmaToken ?? '');
        setGithubToken(payload?.githubToken ?? '');
      }
    };
  }, []);

  const handleChangeFigmaToken = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setFigmaToken(event.currentTarget.value);
  }, []);

  const handleChangeGithubToken = useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >((event) => {
    setGithubToken(event.currentTarget.value);
  }, []);

  const handleSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
    (event) => {
      setErrorMessage('');
      event.preventDefault();
      setStep(Step.Processing);
      parent.postMessage({ pluginMessage: { type: 'extract' } }, '*');
    },
    [],
  );

  const handleClickCancel = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleExtractError = useCallback((msg: string) => {
    setStep(Step.Pending);
    setErrorMessage(msg);
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
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
          <form>
            <label htmlFor="figmaToken">Figma personal access token</label>
            <input
              id="figmaToken"
              type="password"
              name="figmaToken"
              placeholder="figd_..."
              value={figmaToken}
              onChange={handleChangeFigmaToken}
            />
          </form>
          <form>
            <label htmlFor="githubToken">Github personal access token</label>
            <input
              id="githubToken"
              type="password"
              name="githubToken"
              placeholder="ghp_..."
              value={githubToken}
              onChange={handleChangeGithubToken}
            />
          </form>
          <form>
            <label htmlFor="route">추출할 경로 (루트 기준)</label>
            <input id="route" value={config.repository.iconExtractPath} />
          </form>
          {errorMessage ? (
            <span
              style={{
                color: 'red',
              }}
            >
              {errorMessage}
            </span>
          ) : (
            <span
              style={{
                color: 'black',
              }}
            >
              토큰은 추출 성공 시 로컬 스토리지에 저장됩니다.
            </span>
          )}
        </div>

        {step === Step.Pending && (
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
            <button type="submit">아이콘 추출</button>
            <button type="submit" onClick={handleClickCancel}>
              선택 단계로
            </button>
          </div>
        )}

        {step === Step.Processing && (
          <Progress
            figmaToken={figmaToken}
            githubToken={githubToken}
            onError={handleExtractError}
          />
        )}
      </div>
    </form>
  );
}

export default IconExtract;