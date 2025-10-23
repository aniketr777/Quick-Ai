import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./pages/Layout";
import DashBoard from "./pages/DashBoard"
import BlogTitle from "./pages/BlogTitle"
import WriteArticles from "./pages/WriteArticles"
import RemoveObj from "./pages/RemoveObj"
import ReviewResume from "./pages/ReviewResume"
import GenerateImage from "./pages/GenerateImage"
import RemoveBg from "./pages/RemoveBg"
import Community from "./pages/Community"
import {Toaster} from "react-hot-toast"
import PromptVault from "./pages/Promptvault";
import {useAuth} from "@clerk/clerk-react";
import { useEffect } from "react";
function App() {



  // const { getToken } = useAuth();

  // useEffect(() => {
  //   const fetchToken = async () => {
  //     const token = await getToken(); // wait for the promise
  //     console.log("JWT:", token);
  //   };

  //   fetchToken();
  // }, [getToken]);

  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/ai" element={<Layout />}>
          <Route index element={<DashBoard />}></Route>
          <Route path="write-article" element={<WriteArticles />}></Route>
          <Route path="blog-titles" element={<BlogTitle />}></Route>
          <Route path="remove-background" element={<RemoveBg />}></Route>
          <Route path="remove-object" element={<RemoveObj />}></Route>
          <Route path="review-resume" element={<ReviewResume />}></Route>
          <Route path="generate-images" element={<GenerateImage />}></Route>
          <Route path="promptvault" element={<PromptVault />}></Route>
          <Route path="community" element={<Community />}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
