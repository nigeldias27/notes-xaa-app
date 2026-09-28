import { Button, FormLabel, Input, Snackbar, Typography } from "@mui/joy";
import { useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-9/12 h-1/12">
        <div className="w-full h-full">
          <Typography level="h1" className="pb-8">
            Sign Up
          </Typography>
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
            className="mb-6"
            placeholder=""
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            required
          />
          <Button
            onClick={async () => {
              try {
                const response = await fetch("/api/createUser", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    user: email,
                    password: password,
                  }),
                });

                const result = await response.json();
                console.log("Server response:", result);
                setStatus("User Created");
                setOpen(true);
              } catch (error) {
                console.error("Submission failed:", error);
              }
            }}
          >
            Submit
          </Button>
        </div>
      </div>
      <Snackbar
        autoHideDuration={3000}
        open={open}
        variant={"outlined"}
        onClose={(event, reason) => {
          if (reason === "clickaway") {
            return;
          }
          setOpen(false);
        }}
      >
        {status}
      </Snackbar>
    </div>
  );
}
