module.exports = {
    WIDGETS: [
        {
            name: "Heading",
            widgetType: "heading",
            icon: "heading",
            contents: [
                {label: "Title",name: "title",type: "textarea",placeholder: "Enter your title",default: "Add Your Heading Text Here"},
                {label: "URL",name: "link",type: "input",placeholder: "Paste URL",default: "",is_external: false,nofollow: false,custom_attributes: ""},
                {label: "HTML Tag",name: "header_size",type: "select",default: "h2"}
            ],
            styles: [
                {label: "Alignment",name: "align",type: "choices"},
                {label: "Text Color",name: "text_color",type: "color"},
                {label: "Text Size",name: "font_size",type: "range",min: 0,max: 200,step: 1,unit: "px"},
                {label: "Text Weight",name: "font_weight",type: "select",default: "600"},
                {label: "Transform",name: "text_transform",type: "select",default: ""},
                {label: "Text Style",name: "font_style",type: "select",default: ""},
                {label: "Text Decoration",name: "font_decoration",type: "select",default: ""},
                {label: "Line Height",name: "line_height",type: "range",min: 0,max: 100,step: 1,unit: "px"},
                {label: "Text Stroke",name: "text_stroke",type: "range",min: 0,max: 10,step: 0.1,unit: "px"},
                {label: "Text Stroke Color",name: "text_stroke_color",type: "color"},
            ]
        },
        {
            name: "Image",
            widgetType: "image",
            icon: "image",
            contents: [
                {label: "Choose Image",name: "image",type: "media"}
            ],
            styles: [
                {label: "Alignment",name: "align",type: "choices"},
                {label: "Width",name: "width",type: "range",min: 0,max: 1000,step: 1,unit: "px"},
                {label: "Max Width",name: "max_width",type: "range",min: 0,max: 1000,step: 1,unit: "px"},
                {label: "Height",name: "height",type: "range",min: 0,max: 500,step: 1,unit: "px"},
                {label: "Object Fit",name: "object_fit",type: "select",default: ""}
            ]
        },
        {
            name: "Text Editor",
            widgetType: "editor",
            icon: "editor",
            contents: [
                {label: "Text Editor",name: "text_editor",type: "editor",default: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo."}
            ],
            styles: [
                {label: "Alignment",name: "align",type: "choices"},
                {label: "Text Color",name: "text_color",type: "color"},
                {label: "Text Size",name: "font_size",type: "range",min: 0,max: 200,step: 1,unit: "px"},
                {label: "Text Weight",name: "font_weight",type: "select",default: "600"},
                {label: "Transform",name: "text_transform",type: "select",default: ""},
                {label: "Text Style",name: "font_style",type: "select",default: ""},
                {label: "Text Decoration",name: "font_decoration",type: "select",default: ""},
                {label: "Line Height",name: "line_height",type: "range",min: 0,max: 100,step: 1,unit: "px"},
                {label: "Text Stroke",name: "text_stroke",type: "range",min: 0,max: 10,step: 0.1,unit: "px"},
                {label: "Text Stroke Color",name: "text_stroke_color",type: "color"},
            ]
        },
        {
            name: "Slider",
            widgetType: "slider",
            icon: "slider",
            contents: [
                {label: "Choose Images",name: "images",type: "media",multiple: true}
            ],
            styles: [
                {label: "Alignment",name: "align",type: "choices"},
                {label: "Width",name: "width",type: "range",min: 0,max: 1000,step: 1,unit: "px"},
                {label: "Max Width",name: "max_width",type: "range",min: 0,max: 1000,step: 1,unit: "px"},
                {label: "Height",name: "height",type: "range",min: 0,max: 500,step: 1,unit: "px"},
                {label: "Object Fit",name: "object_fit",type: "select",default: ""}
            ]
        },
        {
            name: "Video",
            widgetType: "video",
            icon: "video",
            contents: [
                {label: "Choose video",name: "video",type: "media"}
            ],
            styles: [
                {label: "Alignment",name: "align",type: "choices"},
                {label: "Width",name: "width",type: "range",min: 0,max: 1000,step: 1,unit: "px"},
                {label: "Max Width",name: "max_width",type: "range",min: 0,max: 1000,step: 1,unit: "px"},
                {label: "Height",name: "height",type: "range",min: 0,max: 500,step: 1,unit: "px"},
                {label: "Object Fit",name: "object_fit",type: "select",default: ""}
            ]
        }
    ],
    WIDGET_ELEMENT_OPTIONS: {
        HEADINGS: [
            {id: "h1",label: "H1"},
            {id: "h2",label: "H2"},
            {id: "h3",label: "H3"},
            {id: "h4",label: "H4"},
            {id: "h5",label: "H5"},
            {id: "h6",label: "H6"},
            {id: "div",label: "div"},
            {id: "span",label: "span"},
            {id: "p",label: "p"}
        ],
        ALIGNMENTS: [
            {id: "left",label: "Left"},
            {id: "center",label: "Center"},
            {id: "right",label: "Right"},
            {id: "justify",label: "Justify"}
        ],
        UNITS: ["px","%","em","rem","vw"],
        FONT_STYLES: [
            {id: "",label: "Default"},
            {id: "normal",label: "Normal"},
            {id: "italic",label: "Italic"},
            {id: "oblique",label: "Oblique"}
        ],
        FONT_WEIGHT: [
            {id: "100",label: "100 (Thin)"},
            {id: "200",label: "200 (Extra Light)"},
            {id: "300",label: "300 (Light)"},
            {id: "400",label: "400 (Normal)"},
            {id: "500",label: "500 (Medium)"},
            {id: "600",label: "600 (Semi Bold)"},
            {id: "700",label: "700 (Bold)"},
            {id: "800",label: "800 (Extra Bold)"},
            {id: "900",label: "900 (Black)"},
            {id: "",label: "Default"},
            {id: "normal",label: "Normal"},
            {id: "bold",label: "Bold"}
        ],
        TEXT_TRANSFORM: [
            {id: "",label: "Default"},
            {id: "uppercase",label: "Uppercase"},
            {id: "lowercase",label: "Lowercase"},
            {id: "capitalize",label: "Capitalize"},
            {id: "none",label: "Normal"}
        ],
        TEXT_DECORATION: [
            {id: "",label: "Default"},
            {id: "underline",label: "Underline"},
            {id: "overline",label: "Overline"},
            {id: "line-through",label: "Line Through"},
            {id: "none",label: "None"}
        ],
        FLEX_ALIGN_SELF: [
            {id: "flex-start",label: "Start"},
            {id: "flex-center",label: "Center"},
            {id: "flex-end",label: "End"},
            {id: "stretch",label: "Stretch"}
        ],
        OBJECT_FIT: [
            {id: "",label: "Default"},
            {id: "fill",label: "Fill"},
            {id: "cover",label: "Cover"},
            {id: "contain",label: "Contain"},
        ]
    },
    ADVANCED_ELEMENT_OPTIONS: [
        {
            label: "Layout",
            name: "layout",
            type: "section",
            options: [
                {
                    label: "Margin",
                    name: "margin",
                    type: "dimensions",
                    is_responsive: true,
                    responsive: [],
                    size_units: ["px","%","em","rem","vw"],
                    default: {unit: "px",top: "",right: "",bottom: "",left: "",isLinked: true}
                },
                {
                    label: "Padding",
                    name: "padding",
                    type: "dimensions",
                    is_responsive: true,
                    responsive: [],
                    size_units: ["px","%","em","rem","vw"],
                    default: {unit: "px",top: "",right: "",bottom: "",left: "",isLinked: true}
                },
                {
                    label: "Align Self",
                    name: "flex_align_self",
                    type: "choose",
                    is_responsive: true,
                    responsive: [],
                    options: [
                        {id: "flex-start",value: "Start",icon: "icon-align-start"},
                        {id: "flex-center",value: "Center",icon: "icon-align-center"},
                        {id: "flex-end",value: "End",icon: "icon-align-end"},
                        {id: "stretch",value: "Stretch",icon: "icon-align-stretch"}
                    ],
                    description: "This control will affect contained elements only."
                },
                {
                    label: "Order",
                    name: "flex_order",
                    type: "choose",
                    is_responsive: true,
                    responsive: [],
                    options: [
                        {id: "start",value: "Start",icon: "icon-order-start"},
                        {id: "end",value: "End",icon: "icon-order-end"}
                    ],
                    description: "This control will affect contained elements only."
                },
                {
                    label: "Size",
                    name: "flex_size",
                    type: "choose",
                    is_responsive: true,
                    responsive: [],
                    options: [
                        {id: "none",value: "None",icon: "icon-ban"},
                        {id: "grow",value: "Grow",icon: "icon-grow"},
                        {id: "shrink",value: "Shrink",icon: "icon-shrink"},
                        {id: "custom",value: "Custom",icon: "icon-custom"},
                    ]
                },
                {
                    label: "Flex Grow",
                    name: "flex_grow",
                    type: "number",
                    is_responsive: true,
                    responsive: [],
                    default: 1,
                    placeholder: 1,
                    condition: [
                        {id: "flex_size",value: "custom"}
                    ]
                },
                {
                    label: "Flex Shrink",
                    name: "flex_shrink",
                    type: "number",
                    is_responsive: true,
                    responsive: [],
                    default: 1,
                    placeholder: 1,
                    condition: [
                        {id: "flex_size",value: "custom"}
                    ]
                },
                {
                    label: "Position",
                    name: "position",
                    type: "select",
                    default: "",
                    options: [
                        {id: "",value: "Default"},
                        {id: "absolute",value: "Absolute"},
                        {id: "fixed",value: "Fixed"}
                    ]
                },
                
                {
                    label: "Z-Index",
                    name: "zindex",
                    type: "number",
                    is_responsive: true,
                    responsive: [],
                    default: ""
                },
                {
                    label: "CSS ID",
                    name: "element_id",
                    type: "text",
                    default: "",
                    title: "Add your custom id WITHOUT the Pound key. e.g: my-id"
                },
                {
                    label: "CSS Classes",
                    name: "css_classes",
                    type: "text",
                    default: "",
                    title: "Add your custom class WITHOUT the dot. e.g: my-class"
                }
            ]
        },
        {
            label: "Transform",
            name: "transform",
            type: "section",
            options: [
                
            ]
        },
        {
            label: "Background",
            name: "background",
            type: "section",
            options: [

            ]
        },
        {
            label: "Border",
            name: "border",
            type: "section",
            options: [
                
            ]
        },
        {
            label: "Responsive",
            name: "responsive",
            type: "section",
            options: [
                
            ]
        },
        {
            label: "Attributes",
            name: "attributes",
            type: "section",
            options: [
                
            ]
        },
        {
            label: "Custom CSS",
            name: "custom-css",
            type: "section",
            options: [
                
            ]
        }
    ]
}