import {
  ChatBoxMode,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_K,
  DEFAULT_TOP_P,
  PROMPT_PAYLOAD_KEY
} from '@/common/constants.js';
import { promptDataToState, versionDetailDataToState, removeDuplicateObjects, newlyFetchedTags, uniqueTagsByName, getTagsFromUrl } from '@/common/promptApiUtils.js';
import { createSlice } from '@reduxjs/toolkit';
import { alitaApi } from '../api/alitaApi.js';

export const initialCurrentPrompt = {
  id: undefined,
  [PROMPT_PAYLOAD_KEY.type]: ChatBoxMode.Chat,
  [PROMPT_PAYLOAD_KEY.name]: '',
  [PROMPT_PAYLOAD_KEY.description]: '',
  [PROMPT_PAYLOAD_KEY.tags]: [],
  [PROMPT_PAYLOAD_KEY.context]: '',
  [PROMPT_PAYLOAD_KEY.messages]: [],
  [PROMPT_PAYLOAD_KEY.variables]: [],
  [PROMPT_PAYLOAD_KEY.modelName]: '',
  [PROMPT_PAYLOAD_KEY.temperature]: DEFAULT_TEMPERATURE,
  [PROMPT_PAYLOAD_KEY.maxTokens]: DEFAULT_MAX_TOKENS,
  [PROMPT_PAYLOAD_KEY.topP]: DEFAULT_TOP_P,
  [PROMPT_PAYLOAD_KEY.topK]: DEFAULT_TOP_K,
  [PROMPT_PAYLOAD_KEY.integrationUid]: '',
}

const resetCurrentPromptData = (state) => {
  state.currentPrompt = { ...initialCurrentPrompt };
  state.versions = [];
  state.currentVersionFromDetail = '';
  state.currentPromptSnapshot = { ...initialCurrentPrompt };
};

const promptSlice = createSlice({
  name: 'prompts',
  initialState: {
    list: [],
    filteredList: [],
    tagList: [],
    tagsOnVisibleCards: [],
    tagWidthOnCard: {},
    totalTags: 0,
    currentCardWidth: 0,
    currentPrompt: { ...initialCurrentPrompt },
    currentPromptSnapshot: { ...initialCurrentPrompt },
    versions: [],
    currentVersionFromDetail: '',
    validationError: {},
    isEditing: false,
  },
  reducers: {
    clearFilteredPromptList: (state) => {
      state.filteredList = [];
    },
    filterByTag: (state, action) => {
      const selectedTags = action.payload ?? [];
      if (selectedTags.length < 1) {
        state.filteredList = state.list;
        return
      }
      state.filteredList = state.list.filter(item =>
        item.tags.some(({ id }) =>
          selectedTags.includes(id)
        )
      );
    },
    resetCurrentPromptData,
    resetCurrentPromptDataSnapshot: (state) => {
      state.currentPromptSnapshot = { ...initialCurrentPrompt };
      state.isEditing = false;
    },
    setCurrentPromptDataSnapshot: (state, action) => {
      const { payload } = action;
      state.currentPromptSnapshot = { ...state.currentPromptSnapshot, ...payload };
    },
    useCurrentPromptDataSnapshot: (state) => {
      state.currentPrompt = { ...state.currentPromptSnapshot };
      state.isEditing = false;
    },
    setIsEditing: (state, action) => {
      const { payload } = action;
      state.isEditing = payload;
    },
    setCurrentPromptData: (state, action) => {
      const { data } = action.payload;
      if (!data) return;
      state.currentPrompt = data;
    },
    updateCurrentPromptData: (state, action) => {
      const { key, data } = action.payload;
      if (!key) return;
      state.currentPrompt[key] = data;
    },
    batchUpdateCurrentPromptData: (state, action) => {
      const { payload } = action;
      if (!payload) return;
      state.currentPrompt = { ...state.currentPrompt, ...payload };
    },
    updateSpecificVariable: (state, action) => {
      const { key, data, updateKey } = action.payload;
      if (!key) return;
      const specificVariableIndex = state.currentPrompt[key].findIndex(variable => variable.key === updateKey)
      state.currentPrompt[key][specificVariableIndex].value = data;
    },
    setValidationError: (state, action) => {
      state.validationError = action.payload;
    },
    resetVariable: (state, action) => {
      const { key } = action.payload;
      if (key !== PROMPT_PAYLOAD_KEY.variables) return;
      state.currentPrompt[PROMPT_PAYLOAD_KEY.variables] = [];
    },
    updateTagWidthOnCard: (state, action) => {
      const { tagWidthOnCard = {} } = action.payload;
      state.tagWidthOnCard = { ...tagWidthOnCard, ...state.tagWidthOnCard };
    },
    updateCardWidth: (state, action) => {
      const { cardWidth = 0 } = action.payload;
      state.currentCardWidth = cardWidth;
    },
    setIsLikedToThisPrompt: (state, action) => {
      const { promptId, is_liked, adjustLikes, shouldRemoveIt } = action.payload;
      if (!shouldRemoveIt) {
        state.filteredList = state.filteredList.map((prompt) => {
          if (prompt.id === promptId) {
            prompt.is_liked = is_liked;
            if (adjustLikes) {
              prompt.likes += is_liked ? 1 : -1;
            }
          }
          return prompt;
        });
        if (state.currentPrompt.id == promptId) {
          state.currentPrompt.is_liked = is_liked;
          state.currentPromptSnapshot.is_liked = is_liked;
          if (adjustLikes) {
            state.currentPrompt.likes += is_liked ? 1 : -1;
            state.currentPromptSnapshot.likes += is_liked ? 1 : -1;
          }
        }
      } else {
        state.filteredList = state.filteredList.filter((prompt) => prompt.id !== promptId);
      }
    },
    insertTagToTagList: (state, action) => {
      const { tag } = action.payload;
      const isTagExist = state.tagList.some(oldTag => {
        const { id } = oldTag;
        return tag?.id === id;
      })

      if (!isTagExist) {
        state.tagList = [tag, ...state.tagList]
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(alitaApi.endpoints.promptList.matchFulfilled, (state, { payload }) => {
        const { rows = [] } = payload;
        if (!payload.isLoadMore) {
          state.list = rows
          state.filteredList = rows
          state.tagsOnVisibleCards = uniqueTagsByName(newlyFetchedTags(rows));
        } else {
          state.list = state.list.concat(rows)
          state.filteredList = state.filteredList.concat(rows)
          state.tagsOnVisibleCards = uniqueTagsByName([...state.tagsOnVisibleCards, ...newlyFetchedTags(rows)]);
        }
      });
    builder
      .addMatcher(alitaApi.endpoints.tagList.matchFulfilled, (state, { payload }) => {
        let validTags = [];
        const { rows, total, isLoadMore, skipTotal = false } = payload;
        const storedTagsFromUrl = getTagsFromUrl().map((urlTag) => {
          let remainTag;
          state.tagList.some(tag => {
            if (tag.name === urlTag) {
              remainTag = tag
              return true
            }
          })
          return remainTag;
        });
        if (isLoadMore || skipTotal) {
          validTags = [...storedTagsFromUrl, ...state.tagList, ...rows].filter(tag => tag);
        } else {
          validTags = [...storedTagsFromUrl, ...rows].filter(tag => tag);
        }
        state.tagList = removeDuplicateObjects(validTags)
        if (skipTotal) return;
        state.totalTags = total;
      });
    builder
      .addMatcher(alitaApi.endpoints.getPrompt.matchFulfilled, (state, { payload }) => {
        state.currentPrompt = promptDataToState(payload);
        state.currentPromptSnapshot = { ...state.currentPrompt };
        state.versions = payload.versions;
        state.currentVersionFromDetail = payload.version_details.name;
        state.isEditing = false;
      });
    builder.addMatcher(alitaApi.endpoints.getPrompt.matchRejected, resetCurrentPromptData);
    builder
      .addMatcher(alitaApi.endpoints.getVersionDetail.matchFulfilled, (state, { payload }) => {
        state.currentPrompt = versionDetailDataToState(payload, state.currentPrompt);
        state.currentPromptSnapshot = { ...state.currentPrompt };
        state.currentVersionFromDetail = payload.name;
        state.isEditing = false;
      });
    builder
      .addMatcher(alitaApi.endpoints.getPublicCollection.matchFulfilled, (state, { payload }) => {
        const { prompts: { rows = [] } } = payload;
        state.tagsOnVisibleCards = uniqueTagsByName(newlyFetchedTags(rows));
      });
    builder
      .addMatcher(alitaApi.endpoints.publicPromptList.matchFulfilled, (state, { payload }) => {
        const { rows = [] } = payload;
        if (!payload.isLoadMore) {
          state.list = rows
          state.filteredList = rows
          state.tagsOnVisibleCards = uniqueTagsByName(newlyFetchedTags(rows));
        } else {
          state.list = state.list.concat(rows)
          state.filteredList = state.filteredList.concat(rows)
          state.tagsOnVisibleCards = uniqueTagsByName([...state.tagsOnVisibleCards, ...newlyFetchedTags(rows)]);
        }
      });
    builder
      .addMatcher(alitaApi.endpoints.getCollection.matchFulfilled, (state, { payload }) => {
        const { prompts: { rows = [] } } = payload;
        state.tagsOnVisibleCards = uniqueTagsByName(newlyFetchedTags(rows));
      });
    builder
      .addMatcher(alitaApi.endpoints.datasourceList.matchFulfilled, (state, { payload }) => {
        const { rows = [] } = payload;
        state.tagsOnVisibleCards = uniqueTagsByName(newlyFetchedTags(rows));
      });
    builder
      .addMatcher(alitaApi.endpoints.publicDataSourcesList.matchFulfilled, (state, { payload }) => {
        const { rows = [] } = payload;
        state.tagsOnVisibleCards = uniqueTagsByName(newlyFetchedTags(rows));
      });
    builder
      .addMatcher(alitaApi.endpoints.publicApplicationsList.matchFulfilled, (state, { payload }) => {
        const { rows = [] } = payload;
        state.tagsOnVisibleCards = uniqueTagsByName(newlyFetchedTags(rows));
      });
    builder
      .addMatcher(alitaApi.endpoints.applicationList.matchFulfilled, (state, { payload }) => {
        const { rows = [] } = payload;
        state.tagsOnVisibleCards = uniqueTagsByName(newlyFetchedTags(rows));
      });
    builder
      .addMatcher(alitaApi.endpoints.getPublicPrompt.matchFulfilled, (state, { payload }) => {
        state.currentPrompt = promptDataToState(payload);
        state.currentPromptSnapshot = { ...state.currentPrompt };
        state.versions = payload.versions;
        state.currentVersionFromDetail = payload.version_details.name;
        state.isEditing = false;
      });

    builder.addMatcher(alitaApi.endpoints.getPublicPrompt.matchRejected, resetCurrentPromptData);
  },
})


export const { name, actions } = promptSlice
export default promptSlice.reducer
