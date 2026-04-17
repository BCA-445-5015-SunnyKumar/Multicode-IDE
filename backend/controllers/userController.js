const userModel = require("../models/userModels");
const projectModel = require("../models/projectModels");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const { get } = require("mongoose");
const e = require("express");
const JWT_SECRET = "secretkey";
const axios = require("axios");
require("dotenv").config();

function getStartUpCode(language) {
  language = language.toLowerCase();

  if (language === "javascript") {
    return `console.log('Hello, World!');`;
  } else if (language === "python") {
    return `print('Hello, World!')`;
  } else if (language === "java") {
    return `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
  } else if (language === "c") {
    return `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`;
  } else if (language === "c++") {
    return `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`;
  } else if (language === "ruby") {
    return `puts 'Hello, World!'`;
  } else if (language === "go") {
    return `package main
import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`;
  } else if (language === "php") {
    return `<?php
echo "Hello, World!";
?>`;
  } else if (language === "c#") {
    return `using System;

class HelloWorld {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`;
  } else if (language === "typescript") {
    return `console.log('Hello, World!');`;
  } else {
    return `language not supported`;
  }
}

//signuproute
exports.signup = async (req, res) => {
  try {
    let { email, password, fullName } = req.body;
    let emailConfirm = await userModel.findOne({ email: email });
    if (emailConfirm) {
      return res.status(400).json({
        success: false,
        msg: "email already exists",
      });
    }

    bcrypt.genSalt(12, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        let user = await userModel.create({
          email: email,
          password: hash,
          fullName: fullName,
        });
        return res.status(200).json({
          success: true,
          msg: "user created successfully",
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

//login route
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "user not found",
      });
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (err) {
        return res.status(500).json({
          success: false,
          msg: err.message || "bcrypt error",
        });
      }
      if (result) {
        let token = jwt.sign({ userId: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        });
        return res.status(200).json({
          success: true,
          msg: " user login successfully",
          token: token,
          name: user.fullName,
        });
      } else {
        return res.status(404).json({
          success: false,
          msg: "invalid credentials",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

//create project route
exports.createProject = async (req, res) => {
  try {
    let { name, projectLanguage, token } = req.body;
    let decoded = jwt.verify(token, JWT_SECRET);
    let user = await userModel.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "user not found",
      });
    }
    let project = await projectModel.create({
      name: name,
      projectLanguage: projectLanguage,
      createdBy: user._id,
      code: getStartUpCode(projectLanguage),
    });
    return res.status(200).json({
      success: true,
      msg: "project created successfully",
      projectId: project._id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};

//save project route
exports.saveProject = async (req, res) => {
  try {
    let { projectId, code, token } = req.body;
    let decoded = jwt.verify(token, JWT_SECRET);
    let user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    let project = await projectModel.findById(projectId);
    project.code = code;
    await project.save();
    return res.status(200).json({
      success: true,
      message: "Project saved successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//get projects route
exports.getProjects = async (req, res) => {
  try {
    let { token } = req.body;
    let decoded = jwt.verify(token, JWT_SECRET);
    let user = await userModel.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "user not found",
      });
    }
    let projects = await projectModel.find({ createdBy: user._id });
    return res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      projects: projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//get single project route
exports.getProject = async (req, res) => {
  try {
    let { token, projectId } = req.body;
    let decoded = jwt.verify(token, JWT_SECRET);
    let user = await userModel.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "user not found",
      });
    }
    let project = await projectModel.findOne({ _id: projectId });
    if (project) {
      return res.status(200).json({
        success: true,
        message: "Project  found",
        project: project,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//delete project route
exports.deleteProject = async (req, res) => {
  try {
    let { token, projectId } = req.body;
    let decoded = jwt.verify(token, JWT_SECRET);
    let user = await userModel.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "user not found",
      });
    }

    let project = await projectModel.findOneAndDelete({ _id: projectId });
    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//updateproject route
exports.editProject = async (req, res) => {
  try {
    let { projectId, token, name, projectLanguage } = req.body;

    // Verify token
    let decoded = jwt.verify(token, JWT_SECRET);

    // Find user
    let user = await userModel.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "User not found",
      });
    }

    // Find project
    let project = await projectModel.findOne({
      _id: projectId,
      createdBy: user._id.toString(),
    });
    if (!project) {
      console.log("Project not found for the given user.");
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Update fields only if provided
    project.name = name || project.name;
    project.projectLanguage = projectLanguage || project.projectLanguage;

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//run code route

// -----------------------------
// ===============================
//   RUN CODE CONTROLLER (FINAL)
// ===============================
// Run Code Route
exports.runCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    const languageId = Number(language); // language_id from frontend

    const response = await fetch(
      "https://judge0-ce.p.rapidapi.com/submissions?wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
        }),
      },
    );

    const result = await response.json();

    res.json({
      raw: result,
      output:
        result.stdout ||
        result.stderr ||
        result.compile_output ||
        result.message ||
        "No output",
    });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};

// ----admin route-----

exports.getAllUsersAdmin = async (req, res) => {
  try {
    const users = await userModel.find().sort({ date: -1 });

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.getAllProjectsAdmin = async (req, res) => {
  try {
    const projects = await projectModel.find().sort({ date: -1 });

    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
exports.getAnalytics = async (req, res) => {
  try {
    const data = await projectModel.aggregate([
      {
        $group: {
          _id: "$projectLanguage",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.deleteUserAdmin = async (req, res) => {
  try {
    const { userId } = req.body;

    await userModel.findByIdAndDelete(userId);
    await projectModel.deleteMany({ createdBy: userId });

    res.json({ success: true, msg: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    // ✅ Count total users
    const totalUsers = await userModel.countDocuments();

    // ✅ Count total projects
    const totalProjects = await projectModel.countDocuments();

    // ✅ Get latest 5 users
    const latestUsers = await userModel.find().sort({ _id: -1 }).limit(5);

    // ✅ Get latest 5 projects
    const latestProjects = await projectModel.find().sort({ _id: -1 }).limit(5);

    // ✅ Final response (frontend friendly)
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProjects,
      },
      latestUsers,
      latestProjects,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message,
    });
  }
};

exports.adminLoginSimple = (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false });
};
