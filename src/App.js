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
    setStory([]); // Clear previous story
    try {
      const storyprompt = `Let's role play.
      Create the short children's story. The hero's gender is ${avatar.gender} and age is ${avatar.age}. Story's theme is ${theme} and format is ${format}.
      Create 5 more of these memories that continue this story in an interesting and engaging way.
      It is important to write it in the character's tone of voice.
      Don't include anything age related.
      Show me the next FIVE posts in json format as an array, nothing else:
      {memories: [{
      description: What would the character say about what is she doing? Written in third person. Extremely unique to the character's tone and personality
      }]}`;

      // Call OpenAI GPT-4 API to generate story
      const storyResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [
            { role: "system", content: storyprompt },
          ],
          response_format: { type: "json_object" },
        },
        {
          headers: {
            Authorization: `Bearer ${ApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const sentences = JSON.parse(storyResponse.data.choices[0].message.content);
      // console.log(sentences);

      const seed = Math.floor(Math.random()* 1000000);

      // Use for...of loop instead of map to handle asynchronous operations
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
          output_format: "jpeg"
        };

        const response = await axios.postForm(
          `https://api.stability.ai/v2beta/stable-image/generate/sd3`,
          axios.toFormData(payload, new FormData()),
          {
            validateStatus: undefined,
            responseType: "arraybuffer",
            headers: {
              Authorization: `Bearer ${stabilityApiKey}`,
              Accept: "image/*"
            },
          },
        );

        if (response.status === 200) {
          const imageDataBase64 = btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );

          // Update story with each new image
          setStory((prevStory) => {
            const updatedStory = [...prevStory];
            updatedStory[index] = { text: i.description, image: imageDataBase64 };
            return updatedStory;
          });

          // Incrementally update progress
          setProgress(((index + 1) / sentences.memories.length) * 100);
        } else {
          console.error(`Error generating image: ${response.status}: ${response.data.toString()}`);
        }
      }
    } catch (error) {
      console.error("Error generating story:", error);
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
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Age"
            name="age"
            value={avatar.age}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Baby">Baby</MenuItem>
            <MenuItem value="Toddler">Toddler</MenuItem>
            <MenuItem value="Child">Child</MenuItem>
            <MenuItem value="Teenager">Teenager</MenuItem>
            <MenuItem value="Adult">Adult</MenuItem>
            <MenuItem value="Elderly">Elderly</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Skin Tone"
            name="skinTone"
            value={avatar.skinTone}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Fair">Fair</MenuItem>
            <MenuItem value="Light">Light</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Olive">Olive</MenuItem>
            <MenuItem value="Tan">Tan</MenuItem>
            <MenuItem value="Dark">Dark</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Hair Color"
            name="hairColor"
            value={avatar.hairColor}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Brown">Brown</MenuItem>
            <MenuItem value="Blonde">Blonde</MenuItem>
            <MenuItem value="Black">Black</MenuItem>
            <MenuItem value="Red">Red</MenuItem>
            <MenuItem value="Grey">Grey</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Hair Style"
            name="hairStyle"
            value={avatar.hairStyle}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Short">Short</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Long">Long</MenuItem>
            <MenuItem value="Curly">Curly</MenuItem>
            <MenuItem value="Straight">Straight</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Eye Color"
            name="eyeColor"
            value={avatar.eyeColor}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Blue">Blue</MenuItem>
            <MenuItem value="Green">Green</MenuItem>
            <MenuItem value="Brown">Brown</MenuItem>
            <MenuItem value="Hazel">Hazel</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Eye Shape"
            name="eyeShape"
            value={avatar.eyeShape}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Almond">Almond</MenuItem>
            <MenuItem value="Round">Round</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="EyeBrows"
            name="eyebrows"
            value={avatar.eyebrows}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Thick">Thick</MenuItem>
            <MenuItem value="Thin">Thin</MenuItem>
            <MenuItem value="Arched">Arched</MenuItem>
            <MenuItem value="Straight">Straight</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Nose"
            name="nose"
            value={avatar.nose}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Small">Small</MenuItem>
            <MenuItem value="Med">Med</MenuItem>
            <MenuItem value="Large">Large</MenuItem>
            <MenuItem value="Button">Button</MenuItem>
            <MenuItem value="Straight">Straight</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Mouth"
            name="mouth"
            value={avatar.mouth}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Full">Full</MenuItem>
            <MenuItem value="Thin">Thin</MenuItem>
            <MenuItem value="Wide">Wide</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Clothing Style"
            name="clothingStyle"
            value={avatar.clothingStyle}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Hat">Hat</MenuItem>
            <MenuItem value="Top">Top</MenuItem>
            <MenuItem value="Bottoms">Bottoms</MenuItem>
            <MenuItem value="Shoes">Shoes</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Pet Companion"
            name="petCompanion"
            value={avatar.petCompanion}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
          >
            <MenuItem value="Dog">Dog</MenuItem>
            <MenuItem value="Cat">Cat</MenuItem>
            <MenuItem value="Bird">Bird</MenuItem>
            <MenuItem value="Rabbit">Rabbit</MenuItem>
            <MenuItem value="Dragon">Dragon</MenuItem>
            <MenuItem value="Unicorn">Unicorn</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <TextField
            label="Personality Traits"
            name="personalityTraits"
            value={avatar.personalityTraits}
            onChange={handlePersonalityChange}
            select
            fullWidth
            margin="normal"
            SelectProps={{ multiple: true }}
          >
            <MenuItem value="Friendly">Friendly</MenuItem>
            <MenuItem value="Curious">Curious</MenuItem>
            <MenuItem value="Brave">Brave</MenuItem>
            <MenuItem value="Shy">Shy</MenuItem>
            <MenuItem value="Energetic">Energetic</MenuItem>
            <MenuItem value="Calm">Calm</MenuItem>
            <MenuItem value="Creative">Creative</MenuItem>
          </TextField>
        </Grid>
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