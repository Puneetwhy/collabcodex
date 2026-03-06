// frontend/src/features/project/projectSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentProject: null,
  draftFiles: new Map(),
  activeFile: 'index.js',
  previewUrl: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    setDraftFiles: (state, action) => {
      state.draftFiles = new Map(Object.entries(action.payload));
    },
    updateDraftFile: (state, action) => {
      const { path, content } = action.payload;
      state.draftFiles.set(path, content);
    },
    setActiveFile: (state, action) => {
      state.activeFile = action.payload;
    },
    setPreviewUrl: (state, action) => {
      state.previewUrl = action.payload;
    },
    clearProjectState: () => initialState,
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