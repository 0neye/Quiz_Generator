import { ParseOutput, ModelAnswer, ModelToolUse, OutputError, Tool } from "./types"

/**
 * Parses the output string and returns an array of ParseOutput objects.
 * @param {string} output - The output string from the model.
 * @param {RegExp[] | null} answerExprs - An array of regular expressions to match model answers.
 * @param {RegExp[] | null} toolExprs - An array of regular expressions to match tool inputs.
 * @param {Tool[] | null} tools - An array of tool objects.
 * @returns {ParseOutput[]} - An array of ParseOutput objects.
 * @throws {Error} - Throws an error if the output argument is null.
 */
export function parseModelOutput(output: string, answerExprs: RegExp[] | null, toolExprs: RegExp[] | null, tools: Tool[] | null): ParseOutput[] {
    if (output === null) {
        throw new Error("output argument to 'parseModelOutput' is null")
    }
    let result: ParseOutput[] = []
    // look for any answers
    if (answerExprs) {
        //console.log(`answerExprs: ${answerExprs}`)
        answerExprs.forEach((answerExpr) => {
            const answer = output.match(answerExpr)?.[0]
            if (answer) {
                result.push({ type: "ModelAnswer", value: answer } as ModelAnswer)
            }
            else {
                return [{ type: "OutputError", value: "I couldn't parse your answer. Please try again." }] as OutputError[]
            }
        })
    }
    // next handle tool use
    if (toolExprs) {
        toolExprs.forEach((toolExpr) => {
            // first get the tool inputs
            const toolInput = output.match(toolExpr)?.[0]
            if (toolInput) {
                // go through tool failure patterns
                let toolFailed = false
                tools?.forEach((tool) => {
                    tool.failure_patterns.forEach((pattern) => {
                        if (pattern.expression.test(toolInput)) {
                            result.push({ value: pattern.message } as OutputError)
                            toolFailed = true
                        }
                    })
                })
                if (!toolFailed) {
                    result.push({ value: toolInput } as ModelToolUse)
                }
            }
            else {
                return [{ type: "OutputError", value: `I couldn't parse your tool input. Please try again.` }] as OutputError[]
            }
        })
    }
    if (result.length === 0) {
        return [{ type: "OutputError", value: "I didn't see you pick a tool or return an answer. Please try again." }] as OutputError[]
    }
    return result
}