"use client"

import React, { useState } from "react"
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
} from "@chakra-ui/react"
import { useMutation } from "@apollo/client"
import { CREATE_POST } from "../graphql/mutations"

// Remove onPostCreated from the interface
interface CreatePostProps {
  gameId: string
  placeholder?: string
}

const CreatePost: React.FC<CreatePostProps> = ({ gameId, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false)
  const onClose = () => setIsOpen(false)
  const cancelRef = React.useRef(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const toast = useToast()

  const [createPost, { loading }] = useMutation(CREATE_POST, {
    onError: (error) => {
      toast({
        title: "Error creating post.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    },
    onCompleted: () => {
      toast({
        title: "Post created.",
        description: "Your post has been created successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
      onClose()
      // Refresh the page or trigger a state update
      window.location.reload()
    },
  })

  const handleSubmit = async () => {
    if (!title || !content) {
      toast({
        title: "Missing fields.",
        description: "Please fill in all fields.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    await createPost({
      variables: {
        gameId: gameId,
        title: title,
        content: content,
      },
    })
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} colorScheme="blue">
        {placeholder || "Create Post"}
      </Button>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Create a New Post
            </AlertDialogHeader>

            <AlertDialogBody>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
              </FormControl>

              <FormControl mt={4}>
                <FormLabel>Content</FormLabel>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} />
              </FormControl>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleSubmit} ml={3} isLoading={loading}>
                Create
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default CreatePost
