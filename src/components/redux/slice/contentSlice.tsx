import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { addDoc, collection, deleteDoc, doc, getCountFromServer, getDoc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore"
import { ContentSliceTypes, PostData, PostState, UserInformations } from "../../../utils/types"
import { db } from "../../../firebase/firebase"

const initialState: ContentSliceTypes | PostState = {
    userLikesCollection: [],
    userLikesCollectionStatus: "",
    user: [],
    userStatus: "",
    post: [],
    postStatus: "",
    content: [],
    contentStatus: "",
    currentPost: null,
    comment: [],
    commentStatus: "",
    likesCount: 0,
    likesCountStatus: "",
    postsCount: 0,
    postsCountStatus: ""
}

export const handleComment = createAsyncThunk("commentsCollection", async (id: string) => {
    const comment = (await getDoc(doc(db, "commentsCollection", id))).data()
    let getComment: string[] = []
    if (comment) {
        for (const [key] of Object.entries(comment)) {
            getComment.push(key)
        }
    }
    return getComment
})

export const setContent = createAsyncThunk("content", async ({ postsCollectionId, categoryId }: { postsCollectionId: string, categoryId: string }) => {
    const getContent = (await getDocs(query(
        collection(db, `postsCollection/${postsCollectionId}/posts`),
        orderBy("createdAt", "desc"),
        limit(10)
    ))).docs.map(d => d.data())
    if (getContent.length === 0 && postsCollectionId) {
        await deleteDoc(doc(db, "categoryId", categoryId)).catch(e => console.log("Error deleting category: ", e))
        await deleteDoc(doc(db, `postsCollection`, postsCollectionId))
    }
    return getContent
})

export const setUserContent = createAsyncThunk("userContent", async (id: string | undefined) => {
    const getContent = (await getDocs(query(
        collection(db, `users/${id}/posts`),
        orderBy("createdAt", "desc"),
        limit(10)
    ))).docs.map(d => d.data())
    return getContent
})

export const recentContent = createAsyncThunk("recentContent", async () => {
    const getContent = (await getDocs(query(
        collection(db, `postsCollection`),
        orderBy("createdAt", "desc"),
        limit(10)
    ))).docs.map(d => d.data())
    const getPosts = [];
    for (const d of getContent) {
        const subDoc = (await getDocs(query(
            collection(db, `postsCollection/${d.postsCollectionId}/posts`),
            orderBy("createdAt", "desc"),
            limit(2)
        ))).docs.map(d => d.data())
        getPosts.push(...subDoc)
    }
    return getPosts
})

export const setPost = createAsyncThunk("post", async ({ postsCollectionId, postID }: { postsCollectionId: string, postID: string }) => {
    const getContent = (await getDoc(doc(db, `postsCollection/${postsCollectionId}/posts/${postID}`))).data()
    return getContent
})

export const handleLike = createAsyncThunk("likes", async ({ data, user }: { data: PostData, user: UserInformations }) => {
    const time = new Date().valueOf()
    const addLike = await addDoc(collection(db, `likesCollection/${data.likesCollectionId}/likes`), {})
    const like = await updateDoc(doc(db, `likesCollection/${data.likesCollectionId}/likes`, addLike.id), {
        createdAt: time,
        createdBy: user.uid,
        createdName: user.displayName,
        postId: data?.postID,
        likeId: addLike.id
    })

    return like
})

export const likesCount = createAsyncThunk("likesCount", async (id: string) => {
    const likes = (await getCountFromServer(collection(db, `likesCollection/${id}/likes`))).data().count
    return likes
})

export const handlePostsCount = createAsyncThunk("postCount", async (id: string) => {
    const posts = (await getCountFromServer(collection(db, `postsCollection/${id}/posts`))).data().count
    return posts
})

export const userLikeStatusAction = createAsyncThunk("likes", async ({ data, user }: { data: PostData, user: UserInformations }) => {
    if (data) {
        const getLike = (await getDocs(query(
            collection(db, `likesCollection/${data.likesCollectionId}/likes`),
            where("createdBy", "==", user?.uid)
        ))).docs.map(d => d.data())
        return getLike
    }
})

const contentSlice = createSlice({
    name: "content",
    initialState,
    reducers: {
        setCurrentPost: (state, action: PayloadAction<PostData>) => {
            state.currentPost = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(userLikeStatusAction.fulfilled, (state, action) => {
            state.userLikesCollection = action.payload
            state.userLikesCollectionStatus = "fulfilled"
        })
        builder.addCase(userLikeStatusAction.pending, state => {
            state.userLikesCollectionStatus = "pending"
        })
        builder.addCase(userLikeStatusAction.rejected, state => {
            state.userLikesCollectionStatus = "rejected"
        })
        builder.addCase(setContent.fulfilled, (state, action) => {
            state.content = action.payload
            state.contentStatus = "fulfilled"
        })
        builder.addCase(setContent.pending, state => {
            state.contentStatus = "pending"
        })
        builder.addCase(setContent.rejected, state => {
            state.contentStatus = "rejected"
        })
        builder.addCase(setUserContent.fulfilled, (state, action) => {
            state.content = action.payload
            state.contentStatus = "fulfilled"
        })
        builder.addCase(setUserContent.pending, state => {
            state.contentStatus = "pending"
        })
        builder.addCase(setUserContent.rejected, state => {
            state.contentStatus = "rejected"
        })
        builder.addCase(recentContent.fulfilled, (state, action) => {
            state.content = action.payload
            state.contentStatus = "fulfilled"
        })
        builder.addCase(recentContent.pending, state => {
            state.contentStatus = "pending"
        })
        builder.addCase(recentContent.rejected, state => {
            state.contentStatus = "rejected"
        })
        builder.addCase(handleComment.fulfilled, (state, action) => {
            state.comment = action.payload
            state.commentStatus = "fulfilled"
        })
        builder.addCase(handleComment.pending, state => {
            state.commentStatus = "pending"
        })
        builder.addCase(handleComment.rejected, state => {
            state.commentStatus = "rejected"
        })
        builder.addCase(likesCount.fulfilled, (state, action) => {
            state.likesCount = action.payload
            state.likesCountStatus = "fulfilled"
        })
        builder.addCase(likesCount.pending, state => {
            state.likesCountStatus = "pending"
        })
        builder.addCase(likesCount.rejected, state => {
            state.likesCountStatus = "rejected"
        })
        builder.addCase(handlePostsCount.fulfilled, (state, action) => {
            state.postsCount = action.payload
            state.postsCountStatus = "fulfilled"
        })
        builder.addCase(handlePostsCount.pending, state => {
            state.postsCountStatus = "pending"
        })
        builder.addCase(handlePostsCount.rejected, state => {
            state.postsCountStatus = "rejected"
        })
        builder.addCase(setPost.fulfilled, (state, action) => {
            state.post = action.payload
            state.postStatus = "fulfilled"
        })
        builder.addCase(setPost.pending, state => {
            state.postStatus = "pending"
        })
        builder.addCase(setPost.rejected, state => {
            state.postStatus = "rejected"
        })
    }
})

export const { setCurrentPost } = contentSlice.actions;
export default contentSlice.reducer;