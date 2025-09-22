import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
//import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import AppRoutes from "./routes/app-routes";
import {CartProvider } from '../src/context/CartContext';

const queryClient = new QueryClient();

const App = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <AppRoutes />
        </CartProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;