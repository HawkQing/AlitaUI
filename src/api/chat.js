import { PAGE_SIZE } from '@/common/constants';
import { alitaApi } from "./alitaApi.js";

const TAG_TYPE_CONVERSATIONS = 'TAG_TYPE_CONVERSATIONS'
const TAG_TYPE_CONVERSATION_DETAILS = 'TAG_TYPE_CONVERSATION_DETAILS'
const TAG_TYPE_TOTAL_CONVERSATIONS = 'TAG_TYPE_TOTAL_CONVERSATIONS'

const apiSlicePath = '/chat'
const headers = {
  "Content-Type": "application/json"
}

export const apiSlice = alitaApi.enhanceEndpoints({
  addTagTypes: [TAG_TYPE_CONVERSATION_DETAILS]
}).injectEndpoints({
  endpoints: build => ({
    conversationList: build.query({
      query: ({ projectId, page, params, pageSize = PAGE_SIZE }) => ({
        url: apiSlicePath + '/conversations/prompt_lib/' + projectId,
        params: {
          ...params,
          limit: pageSize,
          offset: page * pageSize
        }
      }),
      providesTags: [TAG_TYPE_CONVERSATIONS],
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
    conversationCreate: build.mutation({
      query: ({ projectId, ...body }) => {
        return ({
          url: apiSlicePath + '/conversations/prompt_lib/' + projectId,
          method: 'POST',
          headers,
          body,
        });
      },
      providesTags: (result, error) => {
        if (error) {
          return []
        }
        return [TAG_TYPE_CONVERSATION_DETAILS, ({ type: TAG_TYPE_CONVERSATION_DETAILS, id: result?.id })]
      },
      invalidatesTags: [TAG_TYPE_TOTAL_CONVERSATIONS, TAG_TYPE_CONVERSATIONS]
    }),
    conversationEdit: build.mutation({
      query: ({ projectId, id, ...body }) => {
        return ({
          url: apiSlicePath + '/conversation/prompt_lib/' + projectId + '/' + id,
          method: 'PUT',
          headers,
          body,
        });
      },
      invalidatesTags: (result, error) => {
        if (error) return []
        return [({ type: TAG_TYPE_CONVERSATION_DETAILS, id: result?.id }), TAG_TYPE_CONVERSATION_DETAILS]
      }
    }),
    deleteConversation: build.mutation({
      query: ({ projectId, id }) => {
        return ({
          url: apiSlicePath + '/conversation/prompt_lib/' + projectId + '/' + id,
          method: 'DELETE',
        });
      },
      invalidatesTags: [TAG_TYPE_TOTAL_CONVERSATIONS, TAG_TYPE_CONVERSATIONS],
    }),
    conversationDetails: build.query({
      query: ({ projectId, id }) => {
        const url = apiSlicePath + '/conversation/prompt_lib/' + projectId + '/' + id
        return {
          url
        }
      },
      providesTags: (result, error) => {
        if (error) {
          return []
        }
        return [TAG_TYPE_CONVERSATION_DETAILS, ({ type: TAG_TYPE_CONVERSATION_DETAILS, id: result?.id })]
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

  })
})

export const {
  useConversationListQuery,
  useLazyConversationListQuery,
  useConversationCreateMutation,
  useConversationEditMutation,
  useConversationDetailsQuery,
  useLazyConversationDetailsQuery,
  useDeleteConversationMutation,
} = apiSlice

