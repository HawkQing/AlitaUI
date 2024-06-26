import { PAGE_SIZE, PUBLIC_PROJECT_ID } from '@/common/constants';
import { alitaApi } from "./alitaApi.js";

const TAG_TYPE_APPLICATIONS = 'TAG_TYPE_APPLICATIONS'
const TAG_TYPE_PUBLIC_APPLICATIONS = 'TAG_TYPE_PUBLIC_APPLICATIONS'
const TAG_TYPE_APPLICATION_DETAILS = 'TAG_TYPE_APPLICATION_DETAILS'
const TAG_TYPE_TOTAL_APPLICATIONS = 'TAG_TYPE_TOTAL_APPLICATIONS'
const TAG_TYPE_TOTAL_PUBLIC_APPLICATIONS = 'TAG_TYPE_TOTAL_PUBLIC_APPLICATIONS'

const apiSlicePath = '/applications'
const apiSlicePathForLike = '/prompt_lib/like/prompt_lib/';
const headers = {
  "Content-Type": "application/json"
}

export const apiSlice = alitaApi.enhanceEndpoints({
  addTagTypes: [TAG_TYPE_APPLICATION_DETAILS]
}).injectEndpoints({
  endpoints: build => ({
    applicationList: build.query({
      query: ({ projectId, page, params, pageSize = PAGE_SIZE }) => ({
        url: apiSlicePath + '/applications/prompt_lib/' + projectId,
        params: {
          ...params,
          limit: pageSize,
          offset: page * pageSize
        }
      }),
      providesTags: [TAG_TYPE_APPLICATIONS],
      transformResponse: (response, meta, args) => {
        return {
          ...response,
          isLoadMore: args.page > 0,
        };
      },
      // Only keep one cacheEntry marked by the query's endpointName
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const sortedObject = {};
        Object.keys(queryArgs)
          .sort()
          .forEach(function (prop) {
            sortedObject[prop] = queryArgs[prop];
          });
        return endpointName + JSON.stringify(sortedObject);
      },
      // merge new page data into existing cache
      merge: (currentCache, newItems) => {
        if (newItems.isLoadMore) {
          currentCache.rows.push(...newItems.rows);
        } else {
          // isLoadMore means whether it's starting to fetch page 0, 
          // clear cache to avoid duplicate records
          currentCache.rows = newItems.rows;
          currentCache.total = newItems.total;
        }
      },
      // Refetch when the page, pageSize ... arg changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    totalApplications: build.query({
      query: ({ projectId, params }) => ({
        url: apiSlicePath + '/applications/prompt_lib/' + projectId,
        params: {
          ...params,
          limit: 1,
          offset: 0
        }
      }),
      providesTags: [TAG_TYPE_TOTAL_APPLICATIONS],
    }),
    publicApplicationsList: build.query({
      query: ({ page, params, pageSize = PAGE_SIZE }) => ({
        url: apiSlicePath + '/public_applications/prompt_lib/',
        params: {
          ...params,
          limit: pageSize,
          offset: page * pageSize
        }
      }),
      providesTags: [TAG_TYPE_PUBLIC_APPLICATIONS],
      transformResponse: (response, meta, args) => {
        return {
          ...response,
          isLoadMore: args.page > 0,
        };
      },
      // Only keep one cacheEntry marked by the query's endpointName
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const sortedObject = {};
        Object.keys(queryArgs)
          .sort()
          .forEach(function (prop) {
            sortedObject[prop] = queryArgs[prop];
          });
        return endpointName + JSON.stringify(sortedObject);
      },
      // merge new page data into existing cache
      merge: (currentCache, newItems) => {
        if (newItems.isLoadMore) {
          currentCache.rows.push(...newItems.rows);
        } else {
          // isLoadMore means whether it's starting to fetch page 0, 
          // clear cache to avoid duplicate records
          currentCache.rows = newItems.rows;
          currentCache.total = newItems.total;
        }
      },
      // Refetch when the page, pageSize ... arg changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
    totalPublicApplications: build.query({
      query: ({ params }) => ({
        url: apiSlicePath + '/public_applications/prompt_lib',
        params: {
          ...params,
          limit: 1,
          offset: 0
        }
      }),
      providesTags: [TAG_TYPE_TOTAL_PUBLIC_APPLICATIONS],
    }),
    likeApplication: build.mutation({
      query: (applicationId) => {
        return ({
          url: apiSlicePathForLike + PUBLIC_PROJECT_ID + '/application/' + applicationId,
          method: 'POST',
        });
      },
      invalidatesTags: [TAG_TYPE_TOTAL_PUBLIC_APPLICATIONS, TAG_TYPE_APPLICATION_DETAILS],
    }),
    unlikeApplication: build.mutation({
      query: (applicationId) => {
        return ({
          url: apiSlicePathForLike + PUBLIC_PROJECT_ID + '/application/' + applicationId,
          method: 'DELETE',
        });
      },
      invalidatesTags: [TAG_TYPE_TOTAL_PUBLIC_APPLICATIONS, TAG_TYPE_APPLICATION_DETAILS],
    }),
    applicationCreate: build.mutation({
      query: ({ projectId, ...body }) => {
        // TODO: use FormData to support image upload
        // const form = new FormData()

        // if (body?.icon) {
        //   form.append('icon', body.icon)
        //   delete body.icon
        // }

        // form.append('data', JSON.stringify(body))

        // return ({
        //   url: apiSlicePath + '/applications/prompt_lib/' + projectId + '?is_form=true',
        //   method: 'POST',
        //   body: form,
        //   formData: true
        // });
        return ({
          url: apiSlicePath + '/applications/prompt_lib/' + projectId,
          method: 'POST',
          headers,
          body,
        });
      },
      providesTags: (result, error) => {
        if (error) {
          return []
        }
        return [TAG_TYPE_APPLICATION_DETAILS, ({ type: TAG_TYPE_APPLICATION_DETAILS, id: result?.id })]
      },
      invalidatesTags: [TAG_TYPE_TOTAL_APPLICATIONS, TAG_TYPE_APPLICATIONS]
    }),
    applicationEdit: build.mutation({
      query: ({ projectId, id, ...body }) => {
        // TODO: use FormData to support image upload
        // const form = new FormData()

        // if (body?.file) {
        //   form.append('file', body.file)
        //   delete body.file
        // }

        // form.append('data', JSON.stringify(body))

        // return ({
        //   url: apiSlicePath + '/application/prompt_lib/' + projectId + '/' + body.id + '?is_form=true',
        //   method: 'PUT',
        //   body: form,
        //   formData: true
        // });
        return ({
          url: apiSlicePath + '/application/prompt_lib/' + projectId + '/' + id,
          method: 'PUT',
          headers,
          body,
        });
      },
      invalidatesTags: (result, error) => {
        if (error) return []
        return [({ type: TAG_TYPE_APPLICATION_DETAILS, id: result?.id }), TAG_TYPE_APPLICATION_DETAILS]
      }
    }),
    deleteApplication: build.mutation({
      query: ({ projectId, applicationId }) => {
        return ({
          url: apiSlicePath + '/application/prompt_lib/' + projectId + '/' + applicationId,
          method: 'DELETE',
        });
      },
      invalidatesTags: [TAG_TYPE_TOTAL_APPLICATIONS, TAG_TYPE_APPLICATIONS],
    }),
    deleteApplicationTool: build.mutation({
      query: ({ projectId, toolId }) => {
        return ({
          url: apiSlicePath + '/tool/prompt_lib/' + projectId + '/' + toolId,
          method: 'DELETE',
        });
      },
      invalidatesTags: [TAG_TYPE_TOTAL_APPLICATIONS, TAG_TYPE_APPLICATIONS],
    }),
    publishApplication: build.mutation({
      query: ({ projectId, applicationId }) => {
        return ({
          url: apiSlicePath + '/publish/prompt_lib/' + projectId + '/' + applicationId,
          method: 'POST',
        });
      },
      invalidatesTags: (result, error, arg) => [{ type: TAG_TYPE_APPLICATION_DETAILS, id: arg.id }],
    }),
    unpublishApplication: build.mutation({
      query: ({ projectId, applicationId }) => {
        return ({
          url: apiSlicePath + '/unpublish/prompt_lib/' + projectId + '/' + applicationId,
          method: 'POST',
        });
      },
      invalidatesTags: (result, error, arg) => [{ type: TAG_TYPE_APPLICATION_DETAILS, id: arg.id }],
    }),
    stopApplicationTask: build.mutation({
      query: ({ projectId, task_id }) => {
        return ({
          url: apiSlicePath + '/task/prompt_lib/' + projectId + '/' + task_id,
          method: 'DELETE',
        });
      },
      invalidatesTags: (result, error) => {
        if (error) return []
        return []
      }
    }),
    applicationDetails: build.query({
      query: ({ projectId, applicationId }) => {
        const url = apiSlicePath + '/application/prompt_lib/' + projectId + '/' + applicationId
        return {
          url
        }
      },
      providesTags: (result, error) => {
        if (error) {
          return []
        }
        return [TAG_TYPE_APPLICATION_DETAILS, ({ type: TAG_TYPE_APPLICATION_DETAILS, id: result?.id })]
      },
      // Only keep one cacheEntry marked by the query's endpointName
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const sortedObject = {};
        Object.keys(queryArgs)
          .sort()
          .forEach(function (prop) {
            sortedObject[prop] = queryArgs[prop];
          });
        return endpointName + JSON.stringify(sortedObject);
      },
    }),
    getApplicationVersionDetail: build.query({
      query: ({ projectId, applicationId, versionId }) => {
        return ({
          url: apiSlicePath + '/version/prompt_lib/' + projectId + '/' + applicationId + '/' + versionId,
          method: 'GET',
        });
      },
    }),
    saveApplicationNewVersion: build.mutation({
      query: ({ projectId, applicationId, ...body }) => {
        return ({
          url: apiSlicePath + '/versions/prompt_lib/' + projectId + '/' + applicationId,
          method: 'POST',
          headers,
          body,
        });
      },
      invalidatesTags: []
    }),
    deleteApplicationVersion: build.mutation({
      query: ({ projectId, applicationId, versionId }) => {
        return ({
          url: apiSlicePath + '/version/prompt_lib/' + projectId + '/' + applicationId + '/' + versionId,
          method: 'DELETE',
        });
      },
      invalidatesTags: []
    }),
    predict: build.mutation({
      query: ({ projectId, versionId, ...body }) => {
        return ({
          url: apiSlicePath + '/predict/prompt_lib/' + projectId + '/' + versionId,
          method: 'POST',
          headers,
          body,
        });
      }
    }),

  })
})

export const {
  useApplicationListQuery,
  useLazyApplicationListQuery,
  useTotalApplicationsQuery,
  useTotalPublicApplicationsQuery,
  useApplicationCreateMutation,
  useApplicationEditMutation,
  useApplicationDetailsQuery,
  useLazyApplicationDetailsQuery,
  usePublicApplicationsListQuery,
  useDeleteApplicationMutation,
  usePredictMutation,
  usePublishApplicationMutation,
  useUnpublishApplicationMutation,
  useLikeApplicationMutation,
  useUnlikeApplicationMutation,
  useDeleteApplicationToolMutation,
  useLazyGetApplicationVersionDetailQuery,
  useSaveApplicationNewVersionMutation,
  useDeleteApplicationVersionMutation,
  useStopApplicationTaskMutation,
} = apiSlice

