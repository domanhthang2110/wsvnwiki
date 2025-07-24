export default function CalculatorPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
      <iframe
        src="https://wsdb.xyz"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="WSDB Calculator"
      />
    </div>
  );
}
