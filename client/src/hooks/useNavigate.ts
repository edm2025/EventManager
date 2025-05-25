import { useLocation } from 'wouter';

export function useNavigate() {
  const [location, setLocation] = useLocation();
  
  const navigate = (to: string) => {
    setLocation(to);
  };
  
  return [location, navigate] as const;
}