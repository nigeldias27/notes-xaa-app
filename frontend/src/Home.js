import {
  Button,
  Card,
  IconButton,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Textarea,
  Typography,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { Settings } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/login");
    }
    fetch(
      `/api/getNotes?${new URLSearchParams({ user: localStorage.getItem("user") }).toString()}`,
    )
      .then((res) => res.json())
      .then((notes) => {
        setNotes([...notes]);
      })
      .catch((err) => console.error(err));
  }, [navigate]);

  return (
    <div>
      <Stack direction={"row"} className="px-16 p-8 flex justify-end">
        <IconButton
          onClick={() => {
            navigate("/settings");
          }}
        >
          <Settings />
        </IconButton>
      </Stack>
      <Stack direction={"row"} className="px-16 p-8 flex justify-between">
        <Typography level="h1">Notes App</Typography>
        <IconButton
          onClick={() => {
            setOpen(true);
          }}
        >
          <AddIcon />
        </IconButton>
      </Stack>
      {notes.map((note) => {
        return (
          <Card className="mx-24 my-4">
            <Typography>{note}</Typography>
          </Card>
        );
      })}
      <Modal open={open}>
        <ModalDialog className="w-2/12">
          <ModalClose
            onClick={() => {
              setOpen(false);
            }}
          />
          <Typography>Add note</Typography>
          <Textarea
            placeholder="Type something here..."
            minRows={3}
            value={selectedNote}
            onChange={(e) => {
              setSelectedNote(e.target.value);
            }}
          />
          <Button
            onClick={async () => {
              try {
                const response = await fetch("/api/setNotes", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    notes: [...notes, selectedNote],
                    user: localStorage.getItem("user"),
                  }),
                });

                const result = await response.json();
                console.log("Server response:", result);
                setNotes((prevNotes) => [...prevNotes, selectedNote]);
                setOpen(false);
              } catch (error) {
                console.error("Submission failed:", error);
              }
            }}
          >
            Add
          </Button>
        </ModalDialog>
      </Modal>
    </div>
  );
}
