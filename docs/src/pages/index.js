import React, { useEffect, useState } from 'react';
import {Redirect} from 'react-router-dom';
import useBaseUrl from '@docusaurus/useBaseUrl';
import AdFit from '../uis/AdFit';

export default function Home() {

  useEffect(() => {
    location.href = '/docs/get-started';
  }, [])

  return <div>
    <AdFit
      unit="DAN-YTmjDwlbcP42HBg6"
      height={100}
      width={320}
      className="adfit-top"
      style={{
        height: 100,
        width: 320,
        marginTop: 48,
      }}
    />
  </div>
}
