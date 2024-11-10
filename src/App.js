import "./App.css";
import Header from "./components/Header";
import TrackingStakingPool from "./components/TrackingStakingPool";
import Container from '@mui/material/Container';

function App() {
  return <div className="App">
    <Container maxWidth="lg" sx={{ margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Header />
      <TrackingStakingPool />
    </Container>

  </div>;
}

export default App;
