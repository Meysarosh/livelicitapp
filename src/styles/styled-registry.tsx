'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export default function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  // Create the server sheet lazily (server only)
  const [sheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    // Inject collected styles into the stream on the server
    const styles = sheet.getStyleElement();
    return <>{styles}</>;
  });

  // On the client, don't wrap with StyleSheetManager (let SC manage itself)
  if (typeof window !== 'undefined') {
    return <>{children}</>;
  }

  // On the server, wrap so styled-components writes into our sheet
  return <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>;
}
