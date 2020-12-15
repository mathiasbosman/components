import {nanoid} from 'nanoid'
import {useState} from 'react'

export const TOAST_ANIMATION_LENGTH = 300

const useToastsInternal = ({autoDismiss = true, timeout = 5000} = {}) => {
  const [toasts, setToasts] = useState([])

  const addToast = (freshToast) => {
    const toastId = nanoid()
    let timeoutId
    if (autoDismiss) {
      timeoutId = window.setTimeout(startRemovingToast, timeout, toastId, true)
    }
    const newToast = {id: toastId, timeoutId, ...freshToast}
    // if there's already a toast on the page, wait for it to animate out before
    // adding a new toast
    if (toasts.length > 0) {
      startRemovingToast(toasts[0].id, true)
      return setTimeout(setToasts, TOAST_ANIMATION_LENGTH, [newToast])
    }
    setToasts([newToast])
  }

  const cancelAutoDismiss = (toast) => {
    window.clearTimeout(toast.timeoutId)
  }

  const startRemovingToast = (id, dismiss = true) => {
    // find the toast to remove and add the `toast-leave` class name
    // after the animation is run, the onAnimationEnd handler in Toast.js calls removeToast
    setToasts((prevState) => prevState.map((toast) => (toast.id === id ? {...toast, className: 'toast-leave'} : toast)))
    setTimeout(removeToast, TOAST_ANIMATION_LENGTH, id, dismiss)
  }

  const removeToast = (id, dismiss) => {
    let currentToast
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => {
        if (autoDismiss && toast.id === id && toast.timeoutId) {
          window.clearTimeout(toast.timeoutId)
        }
        if (toast.id === id) {
          currentToast = toast
        }
        return toast.id !== id
      })
    )
    if (currentToast.onToastDismiss && dismiss) {
      currentToast.onToastDismiss()
    }
  }

  const getToastProps = () => {
    return {toasts, removeToast, startRemovingToast, cancelAutoDismiss}
  }
  return {addToast, getToastProps}
}

export default useToastsInternal