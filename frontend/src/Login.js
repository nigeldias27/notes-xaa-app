import { Button, FormLabel, Input, Typography } from "@mui/joy";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-9/12 h-1/12">
        <div className="w-full h-full">
          <Typography level="h1" className="pb-8">
            Login
          </Typography>
          <Button
            onClick={() => {
              fetch(
                `/api/getAuthSettings?${new URLSearchParams({ user: email }).toString()}`,
              )
                .then((res) => res.json())
                .then((auth) => {
                  const queryString = new URLSearchParams({
                    client_id: auth.clientId,
                    response_type: "code",
                    redirect_uri:
                      "https://notes-xaa-app.onrender.com" + // Should be changed later to ENV var
                      "/resource/callback",
                    scope: "openid",
                    state: auth.state,
                  }).toString();
                  window.location.href = `https://${auth.domain}.com/oauth2/v1/authorize?${queryString}`;
                });
            }}
            variant="outlined"
            className="mb-4"
          >
            Login with Okta
          </Button>
          <Typography className="py-4">OR</Typography>
          <FormLabel>Email</FormLabel>
          <Input
            className="mb-4"
            placeholder="Example: nigel.dias@okta.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
          />
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            className="mb-6"
            placeholder=""
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            required
          />
          <Button
            onClick={() => {
              localStorage.setItem("user", email);
              navigate("/home");
            }}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
