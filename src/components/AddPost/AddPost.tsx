import { ChangeEvent, useEffect, useRef, useState } from "react";
import { setIsOpen, setIsOpenSnackBar } from "../redux/slice/stateSlice"
import { useAppDispatch, useAppSelector } from "../redux/store/store"
import { DocumentData, addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "../../firebase/firebase";
import { PostFormikValues } from "../../utils/types";
import { useFormik } from "formik";
import { BsX } from "react-icons/bs";
import { recentContent } from "../redux/slice/contentSlice";
import Styles from "./style.module.scss"
import { handleCategories, handleCategory } from "../redux/slice/categoriesSlice";


export const isValidURL = (url: string) => {
    const regex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/;
    return regex.test(url);
};

function AddPost() {
    const dispatch = useAppDispatch();

    const user = useAppSelector(state => state.user.user)
    const getCategories = useAppSelector(state => state.categories.categories)
    const getCategory = useAppSelector(state => state.categories.category)
    const isOpen = useAppSelector(state => state.post.post)

    const categoriesID = process.env.REACT_APP_CATEGORIES_ID

    const postRef = collection(db, "posts")
    const commentsRef = collection(db, "commentsCollection")
    const categoryRef = collection(db, "categoryId")
    const categoriesRef = doc(db, "categories", `${categoriesID}`)

    const postContainer = useRef<HTMLDivElement | null>(null)
    const titleRef = useRef<HTMLInputElement | null>(null)
    const [allowedFiles, setAllowedFiles] = useState<string>("")
    const [submitStatus, setSubmitStatus] = useState<boolean>(false)


    const time = new Date().valueOf()

    const initialValues: PostFormikValues = {
        title: "",
        link: "",
        description: "",
        categories: {},
        selectedCategory: "",
        newCategory: "",
        img: null
    }
    const createPostRef = async (post: object) => {
        const postId = await addDoc(postRef, {})
        await updateDoc(doc(db, "posts", postId.id), { ...post, postID: postId.id })
        return postId.id
    }

    const createCommentRef = async () => {
        const postCommentId = await addDoc(commentsRef, {})
        return postCommentId.id
    }

    const createCategoryRef = async (categoryName: string, postId: string) => {
        const postCreateId = await addDoc(categoryRef, {
            categoryName: categoryName,
            createdAt: time,
            createdBy: user?.uid,
            createdName: user?.displayName,
        })
        await updateDoc(doc(db, "categoryId", postCreateId.id), {categoryId: postCreateId.id})
        await updateDoc(categoriesRef, {
            [categoryName]: postCreateId.id
        })
        updateDoc(doc(db, "posts", postId), { categoryId: postCreateId.id })
        dispatch(recentContent())
        return postCreateId.id
    }

    const dowloadURL = async (postId: string) => {
        if (values.img) {
            if (user) {
                const storageRef = ref(storage, `photos/${postId}`)
                const snapshot = await uploadBytes(storageRef, values.img)
                const downdloadURL = await getDownloadURL(snapshot.ref)
                return downdloadURL
            }
        }
    }

    const { values, handleSubmit, handleChange, setFieldValue } = useFormik({
        initialValues,
        onSubmit: async (values) => {
            if (!isValidURL(values.link)) return dispatch(setIsOpenSnackBar({ message: "Invalid URL", status: true }))
            setSubmitStatus(true)
            const commentsCollectionId = await createCommentRef()
            const getURL = await dowloadURL(commentsCollectionId)
            const category = values.selectedCategory === "Other" ? values.newCategory : values.selectedCategory
            const content = {
                commentsCollectionId: commentsCollectionId,
                createdBy: user?.uid,
                createdName: user?.displayName,
                userImg: user?.photoURL,
                createdAt: time,
                updateAt: 0,
                category: category,
                categoryId: getCategories[0][values.selectedCategory] || "",
                content: {
                    title: values.title,
                    link: values.link,
                    description: values.description,
                    img: getURL
                }
            }
            const postId = await createPostRef(content);
            if (values.selectedCategory === "Other") {
                await createCategoryRef(values.newCategory, postId)
            }
            dispatch(recentContent())
            setSubmitStatus(false)
            dispatch(setIsOpen(false))
            dispatch(setIsOpenSnackBar({ message: "Post added", status: true }))
        }
    })

    useEffect(() => {
        dispatch(handleCategories())
        dispatch(handleCategory())
        const handleOutsideClick = (e: MouseEvent) => {
            if (postContainer.current && !postContainer.current.contains(e.target as Node)) {
                dispatch(setIsOpen(false));
            }
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.addEventListener("mousedown", handleOutsideClick);
        } else {
            document.body.style.overflow = "";
            document.removeEventListener("mousedown", handleOutsideClick);
        }
        if (titleRef.current) {
            titleRef.current.focus();
        }
    }, [isOpen, dispatch]);

    return (
        <div className={Styles.postScreenContainer}>
            <div className={Styles.postScrenn} ref={postContainer}>
                <BsX className={Styles.exitButton} onClick={() => dispatch(setIsOpen(false))} />
                <form className={Styles.postDivContainer} onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Add Title"
                        value={values.title}
                        onChange={handleChange}
                        ref={titleRef}
                        maxLength={80}
                        required
                    />
                    <select
                        name="selectedCategory"
                        onChange={handleChange}
                        value={values.selectedCategory}
                        required
                    >
                        <option value="">Select Category</option>
                        {getCategory && getCategory.map((data: DocumentData) =>
                            <option key={data.categoryName} value={data.categoryName} >{data.categoryName}</option>
                        )}
                        <option value="Other">Other</option>
                    </select>
                    {values.selectedCategory === "Other" && <input
                        type="text"
                        name="newCategory"
                        placeholder="Add Category"
                        onChange={handleChange}
                        value={values.newCategory}
                        maxLength={15}
                        required
                    />}
                    <input
                        type="text"
                        name="link"
                        placeholder="Add Link"
                        value={values.link}
                        onChange={handleChange}
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Add Description"
                        className={Styles.postInputDescription}
                        value={values.description}
                        rows={10}
                        cols={60}
                        maxLength={3000}
                        onChange={handleChange}
                        required
                    />
                    {allowedFiles && <label>Invalid file</label>}
                    <input
                        type="file"
                        name="imgFile"
                        accept="image/png, image/jpeg, image/bmp"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const allowedTypes = ["image/png", "image/jpeg", "image/bmp"];
                            if (e.currentTarget.files && e.currentTarget.files[0]) {
                                const file = e.currentTarget.files
                                if (!allowedTypes.includes(file[0].type)) {
                                    setAllowedFiles("invalid file")
                                    e.currentTarget.value = ""
                                } else {
                                    setFieldValue("img", file[0])
                                    setAllowedFiles("")
                                }
                            }
                        }}
                        required
                    />
                    <div className={Styles.postButtonDiv}>
                        <input
                            name="img"
                            type="submit"
                            className={Styles.postButton}
                            value="Done"
                            disabled={submitStatus}
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddPost