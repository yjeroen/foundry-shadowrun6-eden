/**
 * Selects whole text of a input-element. 
 * @param {*} focusedElement The element whose text should be selected
 */
export function selectAllTextOnElement(focusedElement) {
    if(!focusedElement) return;
    if (!["INPUT", "TEXTAREA"].includes(focusedElement.tagName)) return;
    if (['checkbox', 'radio'].includes(focusedElement.type)) return;

    if (focusedElement.type == "number") {
        // Fix for error: "Failed to execute 'setSelectionRange' on 'HTMLInputElement': The input element's type ('number') does not support selection."
        // Text in number fields can't be selected directly so we change their type to text
        // See https://stackoverflow.com/a/55803519 or https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/setSelectionRange
        focusedElement.type = 'text';
        focusedElement.setSelectionRange(0, focusedElement.value.length);
        focusedElement.type = 'number';
    } else
        focusedElement.setSelectionRange(0, focusedElement.value.length);
}