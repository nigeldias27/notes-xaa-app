import { Home } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Button,
  Card,
  FormLabel,
  IconButton,
  Input,
  Snackbar,
  Stack,
  Typography,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [appName, setAppName] = useState("");
  const [status, setStatus] = useState("");
  const [auth, setAuth] = useState({
    domain: "",
    clientId: "",
    clientSecret: "",
  });
  const [apps, setApps] = useState([]);
  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/login");
    }
    fetch(
      `/api/getAuthSettings?${new URLSearchParams({ user: localStorage.getItem("user") }).toString()}`,
    )
      .then((res) => res.json())
      .then((auth) => {
        setAuth({ ...auth });
      })
      .catch((err) => console.error(err));

    fetch(
      `/api/getApps?${new URLSearchParams({ user: localStorage.getItem("user") }).toString()}`,
    )
      .then((res) => res.json())
      .then((apps) => {
        setApps([...apps]);
      })
      .catch((err) => console.error(err));
  }, [navigate]);
  return (
    <div>
      <Stack direction={"row"} className="px-16 p-8 flex justify-end">
        <IconButton
          onClick={() => {
            navigate("/home");
          }}
        >
          <Home />
        </IconButton>
      </Stack>
      <Typography level="h1" className="px-16">
        Settings
      </Typography>
      <div className="px-16 py-8">
        <AccordionGroup>
          <Accordion>
            <AccordionSummary className="text-xl">
              Authentication
            </AccordionSummary>
            <AccordionDetails>
              <div className="w-5/12 p-8">
                <FormLabel>Okta Domain</FormLabel>
                <Input
                  className="mb-4"
                  placeholder=""
                  value={auth.domain}
                  onChange={(e) => {
                    setAuth((prevAuth) => {
                      return { ...prevAuth, domain: e.target.value };
                    });
                  }}
                  required
                />
                <FormLabel>Client Id</FormLabel>
                <Input
                  className="mb-4"
                  placeholder=""
                  value={auth.clientId}
                  onChange={(e) => {
                    setAuth((prevAuth) => {
                      return { ...prevAuth, clientId: e.target.value };
                    });
                  }}
                  required
                />
                <FormLabel>Client Secret</FormLabel>
                <Input
                  className="mb-6"
                  placeholder=""
                  value={auth.clientSecret}
                  onChange={(e) => {
                    setAuth((prevAuth) => {
                      return { ...prevAuth, clientSecret: e.target.value };
                    });
                  }}
                  required
                />
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/setAuthSettings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          ...auth,
                          user: localStorage.getItem("user"),
                        }),
                      });

                      const result = await response.json();
                      console.log("Server response:", result);
                      setStatus("Auth creds updated");
                      setOpen(true);
                    } catch (error) {
                      console.error("Submission failed:", error);
                    }
                  }}
                >
                  Submit
                </Button>
              </div>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary className="text-xl">Apps</AccordionSummary>
            <AccordionDetails>
              <div className="w-5/12 p-8">
                <FormLabel>App Name</FormLabel>
                <Input
                  className="mb-4"
                  placeholder=""
                  value={appName}
                  onChange={(e) => {
                    setAppName(e.target.value);
                  }}
                  required
                />
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/addApp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          appName: appName,
                          user: localStorage.getItem("user"),
                        }),
                      });

                      const result = await response.json();
                      console.log("Server response:", result);
                      setApps(result);
                    } catch (error) {
                      console.error("Submission failed:", error);
                    }
                  }}
                >
                  Submit
                </Button>
              </div>
              {apps.map((app) => (
                <Card>
                  <Typography level="h4">{app.appName}</Typography>
                  <Typography>Client Id: {app.clientId}</Typography>
                  <Typography>Client Secret: {app.clientSecret}</Typography>
                </Card>
              ))}
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
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
    </div>
  );
}
