// frontend/src/features/project/projectApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState()?.auth?.token || localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Project', 'Draft', 'MergeRequest', 'Members', 'Notifications'],
  endpoints: (builder) => ({

    // ========================
    // Projects
    // ========================
    getMyProjects: builder.query({
      query: () => '/projects/my',
      providesTags: ['Project'],
    }),

    getProject: builder.query({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),

    createProject: builder.mutation({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: ['Project'],
    }),

    updateProject: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/projects/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Project', id }],
    }),

    deleteProject: builder.mutation({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Project'],
    }),

    // ========================
    // Drafts
    // ========================
    getDraft: builder.query({
      query: (projectId) => `/drafts/${projectId}`,
      providesTags: (result, error, projectId) => [{ type: 'Draft', id: projectId }],
    }),

    saveDraft: builder.mutation({
      query: ({ projectId, files }) => ({
        url: `/drafts/${projectId}`,
        method: 'POST',
        body: { files },
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Draft', id: projectId }],
    }),

    // ========================
    // Merge Requests
    // ========================
    pushDraft: builder.mutation({
      query: ({ projectId, ...body }) => ({
        url: `/merge-requests/${projectId}/push`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MergeRequest'],
    }),

    getMergeRequests: builder.query({
      query: (projectId) => `/merge-requests/${projectId}`,
      providesTags: (result, error, projectId) =>
        result ? result.map(mr => ({ type: 'MergeRequest', id: mr._id })) : ['MergeRequest'],
    }),

    acceptMerge: builder.mutation({
      query: ({ projectId, mrId }) => ({
        url: `/merge-requests/${projectId}/merge-requests/${mrId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['MergeRequest', 'Project', 'Draft'],
    }),

    rejectMerge: builder.mutation({
      query: ({ projectId, mrId }) => ({
        url: `/merge-requests/${projectId}/merge-requests/${mrId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['MergeRequest'],
    }),

    // ========================
    // Members & Invites
    // ========================
    getMembers: builder.query({
      query: (projectId) => `/collaboration/${projectId}/members`,
      providesTags: (result, error, projectId) => [{ type: 'Members', id: projectId }],
    }),

    updateMemberRole: builder.mutation({
      query: ({ projectId, memberId, role }) => ({
        url: `/collaboration/${projectId}/members/${memberId}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Members', id: projectId }],
    }),

    removeMember: builder.mutation({
      query: ({ projectId, memberId }) => ({
        url: `/collaboration/${projectId}/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Members', id: projectId }],
    }),

    getPendingInvites: builder.query({
      query: () => `/collaboration/invites/pending`,
      providesTags: ['Notifications'],
    }),

    inviteToProject: builder.mutation({
      query: ({ projectId, email }) => ({
        url: `/collaboration/${projectId}/invite`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: ['Members'],
    }),

    acceptInvite: builder.mutation({
      query: (membershipId) => ({
        url: `/collaboration/invites/${membershipId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['Project', 'Notifications'],
    }),

    rejectInvite: builder.mutation({
      query: (membershipId) => ({
        url: `/collaboration/invites/${membershipId}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['Project', 'Notifications'],
    }),

    // ========================
    // Run Code
    // ========================
    runCode: builder.mutation({
      query: ({ projectId, files, language }) => ({
        url: `/projects/${projectId}/run`,
        method: 'POST',
        body: { files, language },
      }),
    }),

    // ========================
    // Export Project
    // ========================
    exportProject: builder.query({
      query: (projectId) => `/projects/${projectId}/export`,
      responseHandler: async (response) => await response.blob(),
    }),

  }),
});

export const {
  useGetMyProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetDraftQuery,
  useSaveDraftMutation,
  usePushDraftMutation,
  useGetMergeRequestsQuery,
  useAcceptMergeMutation,
  useRejectMergeMutation,
  useGetMembersQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetPendingInvitesQuery,
  useInviteToProjectMutation,
  useAcceptInviteMutation,
  useRejectInviteMutation,
  useRunCodeMutation,
  useExportProjectQuery,
} = projectApi;