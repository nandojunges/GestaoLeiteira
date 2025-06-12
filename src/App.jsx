import SistemaBase from './layout/SistemaBase';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <SistemaBase />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} pauseOnHover theme="light" />
    </>
  );
}

export default App;
