const PromptSuggestionButton =({text,onclick})=>{
    return(
        <button className="prompt-suggestion-button" onClick={onclick}>
            {text}
            </button>
    )
}
export default PromptSuggestionButton;