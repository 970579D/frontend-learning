import Login from "../components/login/page";

export default function CoachLoginPage() {
  return <Login title="Coach Login" endpoint="/coach/login" redirectTo="/coach" />;
}