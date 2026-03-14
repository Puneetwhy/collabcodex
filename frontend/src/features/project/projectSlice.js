// frontend/src/features/project/projectSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentProject: null,            // Currently opened project
  draftFiles: new Map(),           // Map of file paths → content
  activeFile: 'index.js',          // Currently active file in editor
  previewUrl: null,                // Preview / live URL
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    // Set the current project
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },

    // Replace all draft files
    setDraftFiles: (state, action) => {
      state.draftFiles = new Map(Object.entries(action.payload));
    },

    // Update a single file content
    updateDraftFile: (state, action) => {
      const { path, content } = action.payload;
      state.draftFiles.set(path, content);
    },

    // Set the currently active file
    setActiveFile: (state, action) => {
      state.activeFile = action.payload;
    },

    // Set the preview/live URL
    setPreviewUrl: (state, action) => {
      state.previewUrl = action.payload;
    },

    // Reset project state to initial
    clearProjectState: () => ({
      ...initialState,
      draftFiles: new Map(), // ensure new Map instance
    }),
  },
});

export const {
  setCurrentProject,
  setDraftFiles,
  updateDraftFile,
  setActiveFile,
  setPreviewUrl,
  clearProjectState,
} = projectSlice.actions;

export default projectSlice.reducer;