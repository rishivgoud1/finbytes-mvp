export default function ComingSoon() {
  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b1524',
        padding: '16px',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/coming-soon.jpeg"
        alt="Finbytes — Media & Research. Loading… www.finbytes.in"
        style={{
          maxWidth: '100%',
          maxHeight: '100vh',
          height: 'auto',
          width: 'auto',
          objectFit: 'contain',
        }}
      />
    </main>
  );
}
