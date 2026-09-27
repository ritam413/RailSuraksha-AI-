import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CryptographicSeal3D } from '@/components/Three/CryptographicSeal3D';

describe('TICKET-04: 3D Holographic Cryptographic Seal Component', () => {
  it('renders CryptographicSeal3D with test ID, SHA-256 header, and verification status', () => {
    const html = renderToStaticMarkup(
      <CryptographicSeal3D
        hashDigest="0x8F9B72A4E310C29D"
        isTamperVerified={true}
      />
    );

    expect(html).toContain('data-testid="3d-cryptographic-seal"');
    expect(html).toContain('3D HOLOGRAPHIC CRYPTOGRAPHIC SEAL');
    expect(html).toContain('SHA-256: 0x8F9B72A4E310C29D');
    expect(html).toContain('TAMPER-EVIDENT MERKLE ROOT: VERIFIED');
  });

  it('renders inspect dossier trigger button', () => {
    const html = renderToStaticMarkup(
      <CryptographicSeal3D
        hashDigest="0x8F9B72A4E310C29D"
        isTamperVerified={true}
      />
    );

    expect(html).toContain('Inspect SHA-256 Merkle Ledger');
  });
});
