import React, { useState } from "react";
import {
  TextField,
  MenuItem,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  LinearProgress,
  Box,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const App = () => {
  const [avatar, setAvatar] = useState({
    name: "Tony",
    gender: "Male",
    age: "Baby",
    skinTone: "Fair",
    hairColor: "Brown",
    hairStyle: "Short",
    eyeColor: "Blue",
    eyeShape: "Almond",
    eyebrows: "Thick",
    nose: "Small",
    mouth: "Full",
    clothingStyle: "Hat",
    personalityTraits: [],
    petCompanion: "",
  });

  const ApiKey = process.env.REACT_APP_API_KEY;
  const stabilityApiKey = process.env.REACT_APP_STABILITY_API_KEY;

  const [theme, setTheme] = useState("Adventure");
  const [format, setFormat] = useState("Ebook");
  const [story, setStory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = (event) => {
    setAvatar({ ...avatar, [event.target.name]: event.target.value });
  };

  const handlePersonalityChange = (event) => {
    const {
      target: { value },
    } = event;
    setAvatar((prevAvatar) => ({
      ...prevAvatar,
      personalityTraits: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const generateStory = async () => {
    setLoading(true);
    setProgress(0);
    setStory([]);
    try {
      const storyprompt = `Let's role play.
      Create the short children's story. The hero's gender is ${avatar.gender} and age is ${avatar.age} and name is ${avatar.name}. Story's theme is ${theme} and format is ${format}.
      Create 5 more of these memories that continue this story in an interesting and engaging way.
      It is important to write it in the character's tone of voice.
      Don't include anything character related.
      Show me the next FIVE posts in json format as an array, nothing else:
      {"memories": [
        {"description": "What would the character say about what is she doing? Written in third person. Extremely unique to the character's tone and personality"}
      ]}`;

      // Call OpenAI GPT-4 API to generate story
      const storyResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            { role: "system", content: storyprompt },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${ApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const sentences = JSON.parse(storyResponse.data.choices[0].message.content);

      const seed = Math.floor(Math.random() * 1000000);

      const tempStory = [];

      for (const [index, i] of sentences.memories.entries()) {
        const payload = {
          prompt: `
          Story Background: ${i.description}

          Character Description:
          Create an image of the main character in story with the following details:

          Gender: ${avatar.gender}
          Age: ${avatar.age}
          Hair: ${avatar.hairStyle} in ${avatar.hairColor}
          Eyes: ${avatar.eyeColor} color with ${avatar.eyeShape} shape and ${avatar.eyebrows} eyebrows
          Clothing Style: ${avatar.clothingStyle}
          Nose Size: ${avatar.nose}
          Mouth: ${avatar.mouth}
          Additionally, if the character has a pet companion, include a ${avatar.petCompanion}. The character’s personality traits are ${avatar.personalityTraits.join(", ")}, if provided.

          Ensure that the character is consistent throughout the story and that the image is vivid and detailed.`,
          seed: seed,
          output_format: "jpeg",
        };

        const response = await axios.post(
          "https://api.stability.ai/v1/generation/stable-diffusion-v1-5/image-to-image",
          payload,
          {
            headers: {
              Authorization: `Bearer ${stabilityApiKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          const imageDataBase64 = btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );

          tempStory[index] = { text: i.description, image: imageDataBase64 };

          setProgress(((index + 1) / sentences.memories.length) * 100);
        } else {
          console.error(`Error generating image: ${response.status}: ${response.data.toString()}`);
        }
      }

      setStory(tempStory);
    } catch (error) {
      console.error("Error generating story:", error);
      alert("There was an error generating the story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const imageHeight = 512; // Set a consistent height for images and skeletons

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Create Your Own Story
      </Typography>
      <Typography variant="h5" gutterBottom>
        Avatar
      </Typography>
      <Grid container spacing={2}>
        {/* Avatar Input Fields */}
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Name"
            name="name"
            value={avatar.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Gender"
            name="gender"
            value={avatar.gender}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Non-Binary">Non-Binary</MenuItem>
          </TextField>
        </Grid>
        {/* Other input fields omitted for brevity */}
      </Grid>

      <hr />
      <Typography variant="h5" gutterBottom>
        Themes
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Theme"
            name="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Adventure">Adventure</MenuItem>
            <MenuItem value="Magic">Magic</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <hr />
      <Typography variant="h5" gutterBottom>
        Format
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Story Format"
            name="format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Illustrated">Illustrated</MenuItem>
            <MenuItem value="Audiobook">Audiobook</MenuItem>
            <MenuItem value="Ebook">Ebook</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <hr />
      <br />
      <Grid container spacing={2} justifyContent={"center"}>
        <Grid item xs={12} md={6} lg={6}>
          <Button
            variant="contained"
            color="primary"
            onClick={generateStory}
            disabled={loading}
            fullWidth
          >
            Generate Story
          </Button>
        </Grid>
      </Grid>

      {/* Loading Bar */}
      {loading && (
        <Box sx={{ width: "100%", mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="textSecondary" align="center">
            Generating Images: {Math.round(progress / 20)} / 5
          </Typography>
        </Box>
      )}

      {/* Story Rendering */}
      <div style={{ marginTop: "20px" }}>
        <Grid container spacing={2}>
          {story.map((item, index) => (
            <Grid item xs={12} sm={12} md={6} lg={4} key={index}>
              <Card sx={{ position: "relative" }}>
                {item.image ? (
                  <CardMedia
                    component="img"
                    image={`data:image/jpeg;base64,${item.image}`}
                    alt={`Story Image ${index}`}
                    sx={{ height: imageHeight }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: imageHeight,
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height="100%"
                    />
                    <CircularProgress
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </Box>
                )}
                <CardContent>
                  <Typography variant="body1">{item.text}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default App;
