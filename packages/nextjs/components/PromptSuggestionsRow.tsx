import PromptSuggestionButton from "./PromptSuggestionButton";

const PromptSuggestionRow = ({ onPromptClick }) => {
    const prompts=[
        "What are the tax implications of buying and selling gold in India?",
        "How is gold tracked in India to prevent illegal transactions?",     
        "What is the capital gains tax on gold investments in India?",
        "How does the government monitor large gold transactions?",
        "Are there any digital or blockchain-based gold tracking systems in India?"
    ]
    return(
        <div className="prompt-suggestion-row"> 
            {prompts.map((prompt,index)=><PromptSuggestionButton key={`suggestion-${index}`} text={prompt} onclick={()=> onPromptClick(prompt)}/>)}
        </div>
    )
}
export default PromptSuggestionRow;